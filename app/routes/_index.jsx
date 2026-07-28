import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Arrow} from '~/components/moon/Icons';
import {Swatch} from '~/components/moon/Swatch';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'MAKEANAP — Bamboo bedding'},
    {name: 'description', content: 'Bamboo sateen bedding, zero-twist towels and loungewear. Pick a colour, sleep on it for a month.'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront} = context;
  const {collections, products} = await storefront.query(HOME_QUERY);

  return {
    collections: collections.nodes,
    products: products.nodes,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {collections, products} = useLoaderData();

  const {heroProduct, bedSwatchProduct, bathSwatchProduct, bedGrid, bathGrid, beyondGrid} = useMemo(
    () => allocateProducts(products),
    [products],
  );

  const heroColorways = useMemo(() => buildColorways(heroProduct), [heroProduct]);

  return (
    <div className="makeanap">
      <HeroSection product={heroProduct} colorways={heroColorways} />
      <RailSection product={heroProduct} colorways={heroColorways} />
      <SwatchSection eyebrow="Bedding" product={bedSwatchProduct} />
      <ComparisonSection />
      <ProductGrid
        title={collections[0]?.title || 'Bedding'}
        products={bedGrid}
        viewAllTo={collections[0] ? `/collections/${collections[0].handle}` : '/collections/all'}
      />
      <ProductGrid
        title={collections[1]?.title || 'Bath'}
        products={bathGrid}
        viewAllTo={collections[1] ? `/collections/${collections[1].handle}` : '/collections/all'}
      />
      <SwatchSection eyebrow="Bath" product={bathSwatchProduct} />
      <ProductGrid title="Beyond the bed" products={beyondGrid} wide viewAllTo="/collections/all" />
      <CloseSection />
    </div>
  );
}

// ─── Data shaping ───────────────────────────────────────────────────────────
// The mockup hard-codes three colourways (Sky / Sand / Mocha) per section.
// Here we derive the same shape from whatever colour-style option a real
// product actually has, so the page works with any catalog.

function colorOption(product) {
  return product?.options?.find((o) => /colou?r/i.test(o.name));
}

function buildColorways(product) {
  const opt = colorOption(product);
  if (!opt) return [];
  return opt.optionValues
    .map((v) => {
      const variant = v.firstSelectableVariant;
      return {
        key: slugify(v.name),
        name: v.name,
        swatchColor: v.swatch?.color,
        swatchImage: v.swatch?.image?.previewImage?.url,
        image: variant?.image || product.featuredImage,
        price: variant?.price || product.priceRange.minVariantPrice,
      };
    })
    .filter((cw) => cw.image);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function allocateProducts(products) {
  const used = new Set();
  const take = (predicate) => {
    const found = products.find((p) => !used.has(p.id) && predicate(p));
    if (found) used.add(found.id);
    return found;
  };
  const takeMany = (n) => {
    const out = [];
    for (const p of products) {
      if (used.has(p.id)) continue;
      out.push(p);
      used.add(p.id);
      if (out.length === n) break;
    }
    return out;
  };

  const hasColorways = (p) => buildColorways(p).length >= 2;

  const heroProduct = take(hasColorways) || take(() => true);
  const bedSwatchProduct = take(hasColorways) || take(() => true);
  const bedGrid = takeMany(4);
  const bathSwatchProduct = take(hasColorways) || take(() => true);
  const bathGrid = takeMany(4);
  const beyondGrid = takeMany(2);

  return {heroProduct, bedSwatchProduct, bathSwatchProduct, bedGrid, bathGrid, beyondGrid};
}

// Samples the last visible column of pixels from an <img> and stretches it
// into a tiny gradient strip, so the colour-plane behind the hero text seams
// perfectly into the photo's cropped edge at any viewport width. Same trick
// as the original mockup's canvas-based edgeStrip().
function edgeStrip(img, box) {
  try {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih || !box.width || !box.height) return null;
    const scale = Math.max(box.width / iw, box.height / ih);
    const offX = (iw * scale - box.width) / 2;
    const offY = (ih * scale - box.height) / 2;
    const sx = Math.max(0, Math.min(iw - 1, Math.round((offX + box.width) / scale) - 1));
    const sy = Math.max(0, offY / scale);
    const sh = Math.min(ih - sy, box.height / scale);
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, 1, sh, 0, 0, 4, 1024);
    return canvas.toDataURL('image/png');
  } catch {
    return null; // tainted canvas — image failed CORS, just skip the seam
  }
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroSection({product, colorways}) {
  const variantUrl = useVariantUrl(product?.handle);
  const order = useMemo(() => colorways.map((c) => c.key), [colorways]);
  const [current, setCurrent] = useState(order[0]);
  const [held, setHeld] = useState(false);
  const timerRef = useRef(null);
  const phRef = useRef(null);
  const imgRefs = useRef({});
  const [seams, setSeams] = useState({});

  useEffect(() => {
    setCurrent(order[0]);
    setHeld(false);
  }, [order]);

  const buildStrips = useCallback(() => {
    const box = phRef.current?.getBoundingClientRect();
    if (!box) return;
    setSeams((prev) => {
      const next = {...prev};
      colorways.forEach((cw) => {
        const img = imgRefs.current[cw.key];
        if (!img || !img.complete || !img.naturalWidth) return;
        const url = edgeStrip(img, box);
        if (url) next[cw.key] = url;
      });
      return next;
    });
  }, [colorways]);

  useEffect(() => {
    if (order.length < 2 || held) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const idx = order.indexOf(c);
        return order[(idx + 1) % order.length];
      });
    }, 4200);
    return () => clearInterval(timerRef.current);
  }, [order, held]);

  useEffect(() => {
    buildStrips();
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildStrips, 120);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('load', buildStrips);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', buildStrips);
      clearTimeout(resizeTimer);
    };
  }, [buildStrips]);

  function selectColorway(key) {
    clearInterval(timerRef.current);
    setHeld(true);
    setCurrent(key);
  }

  if (!product) {
    return (
      <section className="mnp-hero" id="hero">
        <Swatch label="bamboo sateen duvet set" tone="warm" style={{flex: 1}} />
      </section>
    );
  }

  if (colorways.length === 0) {
    return (
      <section className="mnp-hero" id="hero">
        <div className="mnp-hero-ph">
          {product.featuredImage ? (
            <Image data={product.featuredImage} sizes="68vw" className="on" alt={product.featuredImage.altText || product.title} />
          ) : (
            <Swatch label={product.title} tone="warm" style={{height: '100%'}} />
          )}
        </div>
        <div className="mnp-hero-txt">
          <div className="mnp-eye">{product.productType || 'Bamboo bedding'}</div>
          <div className="mnp-word" aria-pressed="true">
            {product.title}
          </div>
          <div className="mnp-hero-meta">
            from <Money data={product.priceRange.minVariantPrice} as="span" />
          </div>
          <Link to={variantUrl} className="mnp-hero-link" aria-label={`View ${product.title}`} />
        </div>
      </section>
    );
  }

  return (
    <section className={`mnp-hero${held ? ' mnp-held' : ''}`} id="hero">
      {colorways.map((cw) => (
        <div
          key={cw.key}
          className={`mnp-seam${cw.key === current ? ' on' : ''}`}
          style={seams[cw.key] ? {backgroundImage: `url(${seams[cw.key]})`} : undefined}
        />
      ))}
      <div className="mnp-hero-ph" ref={phRef}>
        {colorways.map((cw) => (
          <img
            key={cw.key}
            ref={(el) => {
              if (el) imgRefs.current[cw.key] = el;
            }}
            src={cw.image.url}
            alt={cw.image.altText || `${product.title} in ${cw.name}`}
            className={cw.key === current ? 'on' : ''}
            crossOrigin="anonymous"
            onLoad={buildStrips}
          />
        ))}
      </div>
      <div className="mnp-hero-txt">
        <div className="mnp-eye">{product.productType || 'Bamboo bedding'} · colourway</div>
        {colorways.map((cw) => (
          <button key={cw.key} className="mnp-word" aria-pressed={cw.key === current} onClick={() => selectColorway(cw.key)}>
            {cw.name}
            <span className="mnp-ln" />
          </button>
        ))}
        <div className="mnp-hero-meta">
          {colorways.length} colourways · from <Money data={product.priceRange.minVariantPrice} as="span" />
        </div>
        <Link to={variantUrl} className="mnp-hero-link" aria-label={`View ${product.title}`} />
      </div>
    </section>
  );
}

// ─── Rail — every colourway, marquee ───────────────────────────────────────
function RailSection({product, colorways}) {
  if (!colorways || colorways.length < 2) return null;
  const loop = [...colorways, ...colorways];

  return (
    <section className="mnp-rail-wrap">
      <div className="mnp-rail">
        {loop.map((cw, i) => (
          <figure key={`${cw.key}-${i}`}>
            <img src={cw.image.url} alt={cw.image.altText || cw.name} />
            <figcaption>{cw.name}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mnp-rail-hint">Hover to hold</div>
      <div className="mnp-rail-over">
        <h2>Every colour we make, one after another.</h2>
        <div className="mnp-rail-r">
          {product?.title || 'Bedding'} · {colorways.length} colourways
        </div>
      </div>
    </section>
  );
}

// ─── Swatch / detail — a picker synced to a single product's images ───────
function SwatchSection({eyebrow, product}) {
  const colorways = useMemo(() => buildColorways(product), [product]);
  const [current, setCurrent] = useState(colorways[0]?.key);
  const variantUrl = useVariantUrl(product?.handle);

  useEffect(() => {
    setCurrent(colorways[0]?.key);
  }, [colorways]);

  if (!product) return null;

  const active = colorways.find((c) => c.key === current) || colorways[0];
  const description = product.description ? truncate(product.description, 220) : null;

  return (
    <section className="mnp-sw">
      <div className="mnp-sw-in">
        <div className="mnp-sw-ph">
          {colorways.length > 0 ? (
            colorways.map((cw) => (
              <img key={cw.key} src={cw.image.url} alt={cw.image.altText || cw.name} className={cw.key === current ? 'on' : ''} />
            ))
          ) : product.featuredImage ? (
            <div className="mnp-sw-static">
              <Image data={product.featuredImage} sizes="(min-width: 45em) 50vw, 100vw" alt={product.featuredImage.altText || product.title} />
            </div>
          ) : (
            <Swatch label={product.title} tone="neutral" style={{height: '100%'}} />
          )}
        </div>
        <div className="mnp-sw-txt">
          <div className="mnp-eyebrow">{eyebrow}</div>
          <h2>{product.title}</h2>
          {description && <p>{description}</p>}
          <div className="mnp-pick">
            {colorways.length > 0 && (
              <div className="mnp-dots">
                {colorways.map((cw) => (
                  <button
                    key={cw.key}
                    className="mnp-dot"
                    style={{background: cw.swatchColor || (cw.swatchImage ? `url(${cw.swatchImage})` : `url(${cw.image.url})`)}}
                    aria-pressed={cw.key === current}
                    aria-label={cw.name}
                    onClick={() => setCurrent(cw.key)}
                  />
                ))}
              </div>
            )}
            <div className="mnp-now">
              <b>{active?.name || product.vendor}</b> ·{' '}
              <Money data={active?.price || product.priceRange.minVariantPrice} as="span" />
            </div>
          </div>
          <Link to={variantUrl} className="mnp-link">
            View product <Arrow size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

// ─── Comparison — static brand editorial, not tied to a product ───────────
function ComparisonSection() {
  return (
    <section className="mnp-vs">
      <div className="mnp-vs-col">
        <h3>Cotton sateen</h3>
        <div className="mnp-big">Takes the water in, and then keeps it.</div>
        <p>
          Cotton fibre is absorbent by nature. That is useful in a towel and a problem in a sheet: by three in the morning the cotton
          has warmed to you and stopped letting go.
        </p>
        <div className="mnp-end">Softens, then thins, then pills.</div>
      </div>
      <div className="mnp-vs-col dark">
        <h3>Bamboo sateen</h3>
        <div className="mnp-big">Moves it along instead.</div>
        <p>
          Bamboo viscose is spun into a rounder, smoother filament with a more open structure. It carries moisture away rather than
          soaking it up, so the sheet stays closer to the temperature of the room than to yours.
        </p>
        <div className="mnp-end">Softens with every wash. That is the whole trick.</div>
      </div>
    </section>
  );
}

// ─── Grid — real products, editorial captions ──────────────────────────────
function ProductGrid({title, products, wide, viewAllTo}) {
  if (!products?.length) return null;
  return (
    <>
      <div className="mnp-head">
        <h2>{title}</h2>
        <Link to={viewAllTo}>All {title.toLowerCase()}</Link>
      </div>
      <section className={`mnp-grid ${wide ? 'mnp-g2' : 'mnp-g4'}`}>
        {products.map((p, i) => (
          <GridCell key={p.id} product={p} wide={wide} tone={['warm', 'neutral', 'sage', 'clay'][i % 4]} />
        ))}
      </section>
    </>
  );
}

function GridCell({product, wide, tone}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <div className="mnp-cell">
      <Link to={variantUrl}>
        <div className={`mnp-ph${wide ? ' wide' : ''}`}>
          {product.featuredImage ? (
            <Image
              data={product.featuredImage}
              aspectRatio={wide ? '4/3' : '3/4'}
              sizes={wide ? '(min-width: 45em) 50vw, 100vw' : '(min-width: 45em) 25vw, 50vw'}
              alt={product.featuredImage.altText || product.title}
            />
          ) : (
            <Swatch label={product.title} tone={tone} aspect={wide ? '4/3' : '3/4'} />
          )}
        </div>
        <div className="mnp-cap">
          <span>{product.title}</span>
          <span>
            from <Money data={product.priceRange.minVariantPrice} as="span" />
          </span>
        </div>
      </Link>
    </div>
  );
}

// ─── Close — newsletter signup (UI only, wire to a real provider when ready) ─
function CloseSection() {
  return (
    <section className="mnp-close">
      <div>
        <h2>Start with one set.</h2>
        <p>Pick a colour, sleep on it for a month. If it is not the best thing on the bed, send it back.</p>
      </div>
      <form className="mnp-nform" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Sleep letters, once a month" aria-label="Email" required />
        <button type="submit">
          Join <Arrow size={12} />
        </button>
      </form>
    </section>
  );
}

const HOME_QUERY = `#graphql
  fragment HomeProductVariant on ProductVariant {
    id
    availableForSale
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
  }
  fragment HomeProduct on Product {
    id
    title
    handle
    vendor
    productType
    description
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...HomeProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
      }
    }
    products(first: 16, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */

import {Link, useLoaderData} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Arrow, Heart} from '~/components/moon/Icons';
import {Swatch} from '~/components/moon/Swatch';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Make A Nap — Heirloom Bedding'},
    {name: 'description', content: 'The art of rest. Slowly woven, honestly made linen bedding.'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront} = context;

  const [{collections}, {products}] = await Promise.all([
    storefront.query(HOME_COLLECTIONS_QUERY),
    storefront.query(HOME_PRODUCTS_QUERY),
  ]);

  return {
    collections: collections.nodes,
    products: products.nodes,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {collections, products} = useLoaderData();

  const heroProduct = products[0];
  const showcaseProduct = products[1] || products[0];
  const gridProducts = products.slice(0, 6);

  return (
    <div className="app">
      <Hero heroProduct={heroProduct} heroCollection={collections[0]} />
      <Press />
      <Categories collections={collections.slice(0, 4)} />
      <Mission />
      {showcaseProduct && <Showcase product={showcaseProduct} />}
      <Products products={gridProducts} />
      <Journal />
      <Newsletter />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({heroProduct, heroCollection}) {
  const variantUrl = useVariantUrl(heroProduct?.handle);
  const heroImage = heroCollection?.image;

  return (
    <section className="hero">
      <div className="hero-media">
        {heroImage ? (
          <Image
            data={heroImage}
            sizes="100vw"
            style={{height: '100%', width: '100%', objectFit: 'cover'}}
            alt={heroImage.altText || heroCollection.title}
          />
        ) : (
          <Swatch label="lifestyle · linen sheets, soft morning light" tone="warm" style={{height: '100%', aspectRatio: 'auto'}} />
        )}

        <div className="hero-headline">
          <h1>
            <span className="hl-line">The art of</span>
            <span className="hl-line italic"><em>rest.</em> Slowly woven,</span>
            <span className="hl-line">honestly made.</span>
          </h1>
          <div className="hero-sub">
            <span className="dot" /> New season — <em>{heroCollection?.title || 'Volume 04'}</em>
          </div>
        </div>

        <div className="hero-quote">
          <div className="quote-thumb">
            <Swatch label="folded sheets" tone="warm" aspect="1/1" />
          </div>
          <div className="quote-text">
            <strong>Made for the eight hours that matter.</strong>
            <span>Stonewashed European flax. Cut, sewn and shipped from a single workshop in Porto.</span>
          </div>
        </div>

        {heroProduct && (
          <div className="hero-product">
            <div className="hp-chips">
              <span>Linen</span>
              <span>Stonewashed</span>
              <span className="active">New</span>
            </div>
            <Link to={variantUrl} className="hp-cta" aria-label="View product">
              <Arrow size={16} />
            </Link>
            <div className="hp-meta">
              <span className="hp-tag">( from <Money data={heroProduct.priceRange.minVariantPrice} as="span" /> )</span>
              <h3>{heroProduct.title}</h3>
            </div>
            <div className="hp-image">
              {heroProduct.featuredImage ? (
                <Image
                  data={heroProduct.featuredImage}
                  aspectRatio="3/4"
                  sizes="(min-width: 45em) 30vw, 80vw"
                  alt={heroProduct.featuredImage.altText || heroProduct.title}
                />
              ) : (
                <Swatch label="sheet set" tone="neutral" aspect="4/5" />
              )}
            </div>
            <Link className="hp-link" to={variantUrl} aria-label="Open product" />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Press marquee (static editorial) ─────────────────────────────────────────
function Press() {
  const items = ['KINFOLK', 'CEREAL', 'DWELL', 'T MAGAZINE', 'MONOCLE', 'APARTAMENTO', 'WALLPAPER*'];
  return (
    <section className="press">
      <span className="press-lbl">— As seen in</span>
      <div className="press-row">
        {items.map((p) => (
          <span key={p} className="press-item">
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Categories — real collections ────────────────────────────────────────────
function Categories({collections}) {
  if (!collections?.length) return null;
  return (
    <section className="cats" id="collections">
      <header className="cats-hd">
        <span className="eyebrow">02 / Shop by category</span>
        <h2>
          Four pieces.
          <br />
          <em>A complete bed.</em>
        </h2>
        <Link className="link" to="/collections">
          View full catalog <Arrow />
        </Link>
      </header>
      <div className="cats-grid">
        {collections.map((c, i) => (
          <Link key={c.id} to={`/collections/${c.handle}`} className="cat-card">
            <div className="cat-hd">
              <span className="cat-name">{`{ ${c.title.toLowerCase()} }`}</span>
              <span className="cat-arrow">
                <Arrow size={12} />
              </span>
            </div>
            <div className="cat-media">
              {c.image ? (
                <Image data={c.image} aspectRatio="3/4" sizes="(min-width: 45em) 25vw, 50vw" alt={c.image.altText || c.title} />
              ) : (
                <Swatch label={c.title.toLowerCase()} tone={['warm', 'neutral', 'sage', 'clay'][i % 4]} aspect="3/4" />
              )}
            </div>
            <div className="cat-ft">
              <span>{String(i + 1).padStart(2, '0')} —</span>
              <span>{c.description ? `${c.description.slice(0, 28)}${c.description.length > 28 ? '…' : ''}` : c.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Mission (static brand editorial) ─────────────────────────────────────────
function Mission() {
  return (
    <section className="mission" id="about">
      <span className="eyebrow">03 / Our practice</span>
      <div className="mission-body">
        <p className="mission-lead">
          We make bedding the way it was made a hundred years ago — <em>slowly</em>, with one fibre at a time, by people who
          use what they make.
        </p>
        <div className="mission-side">
          <p>
            Every set is cut and stitched in a family workshop in Porto. The flax is grown in Normandy, the wool combed in
            the Yorkshire dales. Nothing leaves the studio without being slept on first.
          </p>
          <a href="#" className="ghost-btn">
            Read our manifesto <Arrow />
          </a>
        </div>
      </div>
      <div className="mission-stats">
        <div>
          <span className="num">04</span>
          <span className="lbl">Materials, ever.</span>
        </div>
        <div>
          <span className="num">36</span>
          <span className="lbl">Hours per set.</span>
        </div>
        <div>
          <span className="num">
            100<i>yr</i>
          </span>
          <span className="lbl">Guarantee.</span>
        </div>
        <div>
          <span className="num">0</span>
          <span className="lbl">Plastic in our supply chain.</span>
        </div>
      </div>
    </section>
  );
}

// ─── Showcase — one real featured product ─────────────────────────────────────
function Showcase({product}) {
  const variantUrl = useVariantUrl(product.handle);
  const variant = product.selectedOrFirstAvailableVariant;
  const optionsSummary = product.options?.map((o) => o.name).join(' / ') || '';

  return (
    <section className="showcase">
      <span className="eyebrow">04 / Featured</span>
      <div className="showcase-stage">
        <h2 className="bigmark">
          <span className="bm-kicker">Make A</span>
          <span className="bm-word">
            <span>n</span>
            <span className="bm-o">a</span>
            <span>p</span>
          </span>
        </h2>
        <Link to={variantUrl} className="showcase-image">
          {product.featuredImage ? (
            <Image data={product.featuredImage} aspectRatio="3/4" sizes="(min-width: 45em) 40vw, 90vw" alt={product.featuredImage.altText || product.title} />
          ) : (
            <Swatch label={product.title.toLowerCase()} tone="warm" aspect="4/5" />
          )}
        </Link>
        <div className="showcase-meta showcase-l">
          <span className="sm-tag">/ 01 — {product.productType || 'featured'}</span>
          <span className="sm-name">{product.title}</span>
          <span className="sm-price">
            from <Money data={product.priceRange.minVariantPrice} as="span" />
          </span>
        </div>
        <div className="showcase-meta showcase-r">
          <span className="sm-tag">{optionsSummary ? `↳ ${optionsSummary}` : ''}</span>
          {variant?.id ? (
            <CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines: [{merchandiseId: variant.id, quantity: 1}]}}>
              {(fetcher) => (
                <button type="submit" className="solid-btn" disabled={fetcher.state !== 'idle' || !variant.availableForSale}>
                  Add to bag <Arrow />
                </button>
              )}
            </CartForm>
          ) : (
            <Link to={variantUrl} className="solid-btn">
              View product <Arrow />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Products — real product grid ─────────────────────────────────────────────
function Products({products}) {
  return (
    <section className="products" id="shop">
      <header className="prods-hd">
        <div>
          <span className="eyebrow">05 / The collection</span>
          <h2>
            This season,
            <br />
            <em>the full collection.</em>
          </h2>
        </div>
        <div className="prods-filters">
          <button className="chip active">All</button>
          <Link to="/collections/all" className="chip">
            Shop all
          </Link>
          <span className="prods-sort">Sort: <em>newest ↓</em></span>
        </div>
      </header>
      <div className="prods-grid">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({product, index}) {
  const variantUrl = useVariantUrl(product.handle);
  const swatchOption = product.options?.find((o) => /colou?r/i.test(o.name));
  const otherVariants = swatchOption ? swatchOption.optionValues.length - 1 : 0;

  return (
    <article className="prod-card">
      <Link to={variantUrl} className="prod-media">
        {product.featuredImage ? (
          <Image data={product.featuredImage} aspectRatio="3/4" sizes="(min-width: 45em) 400px, 100vw" alt={product.featuredImage.altText || product.title} />
        ) : (
          <Swatch label={product.title.toLowerCase()} tone={['warm', 'neutral', 'sage', 'clay'][index % 4]} aspect="4/5" />
        )}
        {product.productType && <span className="prod-tag">{product.productType}</span>}
        <button className="prod-fav" aria-label="Save" onClick={(e) => e.preventDefault()}>
          <Heart size={14} />
        </button>
      </Link>
      <div className="prod-info">
        <span className="prod-num">/ {String(index + 1).padStart(2, '0')}</span>
        <Link to={variantUrl}>
          <h3>{product.title}</h3>
        </Link>
        <div className="prod-row">
          <span className="prod-swatch">
            {swatchOption ? `${swatchOption.optionValues[0].name}${otherVariants > 0 ? `, +${otherVariants}` : ''}` : product.vendor}
          </span>
          <span className="prod-price">
            <Money data={product.priceRange.minVariantPrice} as="span" />
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Journal (editorial — not yet wired to a blog) ────────────────────────────
function Journal() {
  const posts = [
    {kicker: 'Field notes', date: 'April 26', title: 'On the flax fields of Normandy', read: '8 min'},
    {kicker: 'Care', date: 'April 12', title: 'How to wash linen so it lasts a decade', read: '4 min'},
    {kicker: 'Maker', date: 'March 30', title: 'Inside the Porto workshop', read: '6 min'},
  ];
  return (
    <section className="journal" id="journal">
      <header className="prods-hd">
        <div>
          <span className="eyebrow">06 / The journal</span>
          <h2>
            Things we write down
            <br />
            <em>between cuttings.</em>
          </h2>
        </div>
        <a className="link" href="#">
          All entries <Arrow />
        </a>
      </header>
      <div className="journal-grid">
        {posts.map((p, i) => (
          <a key={p.title} href="#" className="journal-card">
            <Swatch label={p.title.toLowerCase()} tone={i === 1 ? 'sage' : i === 2 ? 'warm' : 'neutral'} aspect="4/3" />
            <div className="journal-meta">
              <span>
                {p.kicker} · {p.date}
              </span>
              <span>{p.read}</span>
            </div>
            <h3>{p.title}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Newsletter (UI only — wire to a real email provider when ready) ─────────
function Newsletter() {
  return (
    <section className="news">
      <div className="news-l">
        <span className="eyebrow">07 / The letter</span>
        <h2>
          Letters from
          <br />
          <em>the workshop.</em>
        </h2>
      </div>
      <div className="news-r">
        <p>One note a month. New makings, restocks, the occasional essay on sleep. No marketing — just the work.</p>
        <form className="news-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="your@email" required />
          <button type="submit">
            Subscribe <Arrow />
          </button>
        </form>
        <span className="news-fine">By subscribing you agree to our quiet, single-list policy.</span>
      </div>
    </section>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
`;

const HOME_PRODUCTS_QUERY = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    vendor
    productType
    options {
      name
      optionValues {
        name
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
    selectedOrFirstAvailableVariant {
      id
      availableForSale
    }
  }
  query HomeProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */

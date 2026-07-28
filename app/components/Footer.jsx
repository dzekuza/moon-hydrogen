import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const shopName = header?.shop?.name;

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="mnp-footer">
            <div className="mnp-fgrid">
              <div>
                <div className="mnp-mark">{shopName}</div>
                <p className="mnp-fnote">
                  Bamboo bedding, bath and loungewear.
                </p>
              </div>
              <div>
                <h4>Shop</h4>
                <ul>
                  <li>
                    <Link to="/collections/all">Bedding</Link>
                  </li>
                  <li>
                    <Link to="/collections/all">Bath</Link>
                  </li>
                  <li>
                    <Link to="/collections/all">Loungewear</Link>
                  </li>
                  <li>
                    <Link to="/collections/all">Baby &amp; kids</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Help</h4>
                {footer?.menu && header.shop.primaryDomain?.url ? (
                  <FooterMenu
                    menu={footer.menu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                ) : (
                  <FooterMenu
                    menu={FALLBACK_FOOTER_MENU}
                    primaryDomainUrl=""
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </div>
              <div>
                <h4>More</h4>
                <ul>
                  <li>
                    <Link to="/pages/about">Why bamboo</Link>
                  </li>
                  <li>
                    <Link to="/blogs/journal">Journal</Link>
                  </li>
                  <li>
                    <Link to="/pages/about">Stockists</Link>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mnp-fbot">
              <span>
                © {new Date().getFullYear()} {shopName}
              </span>
              <span>Vilnius, Lithuania</span>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <ul>
      {menu.items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          (primaryDomainUrl && item.url.includes(primaryDomainUrl))
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return (
          <li key={item.id}>
            {isExternal ? (
              <a href={url} rel="noopener noreferrer" target="_blank">
                {item.title}
              </a>
            ) : (
              <NavLink end prefetch="intent" to={url}>
                {item.title}
              </NavLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: null,
      tags: [],
      title: 'Shipping',
      type: 'HTTP',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: null,
      tags: [],
      title: 'Returns',
      type: 'HTTP',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: null,
      tags: [],
      title: 'Care guide',
      type: 'HTTP',
      url: '/pages/about',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: null,
      tags: [],
      title: 'Contact',
      type: 'HTTP',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */

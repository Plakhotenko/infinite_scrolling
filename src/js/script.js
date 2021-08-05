document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'https://images-api.nasa.gov/search?q=earth';
  const imagesWrapper = document.querySelector('#gallery');
  const loader = document.querySelector('#loader');

  const fetchImages = async (baseUrl, page) => {
    const result = [];
    const response = await fetch(`${baseUrl}&page=${page}`);
    const {collection: {items}} = await response.json();

    items.forEach((item) => {
      if (item.links && item.links[0].render === 'image') {
        const href = item.links[0].href;
        if (
          (href.search('jpeg|jpg|webp|avif|gif|png') > 0) &&
          (href.search('video') === -1)
        ) {
          result.push(href);
        }
      }
    });
    return result;
  };

  const renderImages = (images, wrapper) => {
    wrapper.insertAdjacentHTML(
        'beforeEnd',
        images
            .map((imageUrl) => `
              <li>
                <img
                  src=${imageUrl}
                  alt=''
                >
              </li>
            `)
            .join(''),
    );
  };

  let isFetching = false;
  let page = 1;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !isFetching) {
        isFetching = true;
        try {
          const images = await fetchImages(BASE_URL, page);
          renderImages(images, imagesWrapper);
          page++;
          isFetching = false;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }
    });
  }, {
    threshold: 1,
  });

  observer.observe(loader);
});

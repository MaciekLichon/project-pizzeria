import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';


const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.mainMenuLinks = document.querySelectorAll(select.homeMenu.links);

    // thisApp.activatePage(thisApp.pages[0].id);

    const navLinksArr = Array.from(thisApp.navLinks);
    const mainMenuLinksArr = Array.from(thisApp.mainMenuLinks);
    const allLinks = navLinksArr.concat(mainMenuLinksArr);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of allLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();

        const clickedElemenet = this;

        /* get page id from href attribute */
        const id = clickedElemenet.getAttribute('href').replace('#', '');

        /* run activatePage with that id  */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(
        classNames.pages.active, // klasa do dodania lub usuniecia
        page.id == pageId // warunek
      );
      //   if (page.id == pageId) {
      //     page.classList.add(classNames.pages.active);
      //   } else {
      //     page.classList.remove(classNames.pages.active);
      //   }
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function() {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        // console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });
  },

  initBooking: function() {
    const thisApp = this;

    thisApp.bookingWrapper = document.querySelector(select.containerOf.booking);

    new Booking(thisApp.bookingWrapper);
  },

  initHome: function() {
    const thisApp = this;

    thisApp.homeWrapper = document.querySelector(select.containerOf.home);

    new Home(thisApp.homeWrapper);
  },

  init: function() {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initHome();
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },

  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    // console.log('thisApp.productList', thisApp.productList);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
      // console.log('event.detail.product', event.detail.product);
    });
  },

};

app.init();

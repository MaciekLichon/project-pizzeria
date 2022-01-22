import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('all products', thisCart.products);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList); // .cart__order-summary
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee); // .cart__order-delivery .cart__order-price-sum strong
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice); // .cart__order-subtotal .cart__order-price-sum strong
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice); // .cart__total-price strong, .cart__order-total .cart__order-price-sum strong
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber); // .cart__total-number
    thisCart.dom.form = element.querySelector(select.cart.form); // .cart__order
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    thisCart.dom.address = element.querySelector(select.cart.address);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
      // console.log('podany element', event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML); // stworzenie diva i uzupelnienie go szablonem, dzieki 'return div.firstChild' w HTML pojawi sie sam template
    thisCart.dom.productList.appendChild(generatedDOM); // appendChild bo mozna dodac kilka rzeczy do koszyka a kazda to osobny li

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    // console.log('adding product', menuProduct);

    thisCart.update();
  }

  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else { // dodaje else bo przy calkowitym oproznieniu koszyka funkcja remove (z poziomu koszyka) total oraz delivery zostawaly > 0
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }

    // console.log('number', totalNumber);
    // console.log('subtotal', subtotalPrice);
    // console.log('total', thisCart.totalPrice);

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    for (let priceSelector of thisCart.dom.totalPrice) {
      priceSelector.innerHTML = thisCart.totalPrice;
    }
  }

  remove(cartProduct) {
    const thisCart = this;

    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    // console.log(indexOfProduct);
    thisCart.products.splice(indexOfProduct, 1);
    // console.log(cartProduct.dom.wrapper);
    cartProduct.dom.wrapper.remove(); // tutaj remove to metoda JS, CartProduct -> thisCartProduct.dom.wrapper (<li>...</li>)

    thisCart.update();
    // console.log('products', thisCart.products);
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);

    // console.log(payload);
  }
}

export default Cart;

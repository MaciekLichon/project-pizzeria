import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data); // wybranie szablonu template-menu-product i uzupelnienie go danymi z thisProduct.data
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML); // stworzenie diva i uzupelnienie go szablonem, dzieki 'return div.firstChild' w HTML pojawi sie sam template
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu); // #product-list
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // .product__header
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); // .product__order
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); // input, select
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); // [href="#add-to-cart"]
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); // .product__total-price .price
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // .product__images
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); // .widget-amount
  }

  initAccordion(){
    const thisProduct = this;
    const givenProduct = thisProduct.element; // watched/clicked product (each separate product)

    // console.log('thisProduct.element', givenProduct);

    /* find the clickable trigger (the element that should react to clicking) */
    // console.log('clickableTrigger: ', thisProduct.accordionTrigger);

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      let activeProduct = document.querySelector(select.all.menuProductsActive); // #product-list > .product.active
      // console.log('previously active product: ', activeProduct);
      // console.log('given active product: ', givenProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct != givenProduct) {
        activeProduct.classList.remove('active');
      }
      /* toggle active class on thisProduct.element */
      givenProduct.classList.toggle('active');
    });
  }

  initOrderForm() {
    const thisProduct = this;
    //console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs) {
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    // console.log('processOrder');

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;
    // console.log('data.params: ', thisProduct.data.params);
    // for every category (param)...
    // console.log(thisProduct.data.params);
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log('paramId: ', paramId);
      //console.log('param', param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log('optionId: ', optionId); // params.coffe.options (NAME) e.g. latte, cappuccino, espresso
        //console.log('option: ', option); // params.coffe.options (OBJECT) e.g. latte {label: , price: , default: }

        // update price, check if optionId is selected
        if (formData[paramId]) {

          const imageSelector = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(imageSelector);

          // selected
          if (formData[paramId].includes(optionId)) {
            // poza pizza i salatka sa tez obrazki innych dan, ktorych klasy nie pasuja do selektora i zwracaja 'null', dlatego chce wybrac tylko te, ktore pasuja
            if (imageSelector) {
              imageSelector.classList.add(classNames.menuProduct.imageVisible); // active
            }

            if (!option.default) {
              // console.log(optionId, 'selected, not default');
              price += option.price;
            } else {
              // console.log(optionId, 'selected, default');
            }
          // not selected
          } else {
            if (imageSelector) {
              imageSelector.classList.remove(classNames.menuProduct.imageVisible); // active
            }

            if (option.default) {
              // console.log(optionId, 'not selected, default');
              price -= option.price;
            } else {
              // console.log(optionId, 'not selected, not default');
            }
          }
        }
      }
    }
    // update calculated price in the HTML
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    // console.log(thisProduct.amountWidget);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    // console.log('adding', thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams()
    };

    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const productParams = {};

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      productParams[paramId] = {
        label: param.label,
        options: {}
      };

      for (let optionId in param.options) {
        const option = param.options[optionId];

        if (formData[paramId] && formData[paramId].includes(optionId)) {
          productParams[paramId].options[optionId] = option.label;
        }
      }

    }
    return productParams;
  }
}

export default Product;

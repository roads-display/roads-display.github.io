!(function (thisDoc, elementName = "mux-icon") {
  customElements.define(
    elementName,
    class extends HTMLElement {
      log(a, b, c, d) {
        //console.log('WebComponent: mux-icon: ', a || '', b || '', c || '', d || '');
      }

      static get observedAttributes() {
        return ["name"];
      }

      constructor() {
        super();
        this.log("constructor");
        let template = thisDoc.getElementById("mux-icon-template").content;
        this.attachShadow({ mode: "open" }).appendChild(
          template.cloneNode(true)
        );
        this.svg = this.shadowRoot.querySelectorAll("svg");
      }

      attributeChangedCallback(attr, oldValue, newValue) {
        this.log("attributeChanged", attr, oldValue, newValue);
        if (attr == "name") {
          this.svg.forEach((element) => (element.style.display = "none"));
          this.shadowRoot.querySelector(
            "svg[name='" + newValue + "']"
          ).style.display = "inherit";
        }
      }

      connectedCallback() {
        this.log("connected");
      }
    }
  );
})(document.currentScript.ownerDocument);

var WebComponentHelper =
    {
        load: function (jsFile) {
            var $script = document.createElement("script");
            $script.src = jsFile;
            document.head.appendChild($script);
        },

        addTheStyleOnPageToTheShadyDomStyles: function (styleElementSelector) {
            if (window.ShadyCSS && ShadyCSS.CustomStyleInterface) {
                ShadyCSS.CustomStyleInterface.addCustomStyle(document.querySelector(styleElementSelector));
            }
        }

    };





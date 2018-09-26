(function(){
'use strict';

function CurvyTabsPager(pagerContainer, tabbedContent, options) {
    this.container = pagerContainer;
    this.tabBar = tabbedContent;

    options = options || {};
    this.toc = options.toc;
    this.maxPage = this.toc ? this.toc.length : Number(options.maxPage);
    this.num = this.getPageNum(options.startPage) || 1;
    this.path = options.path || options.subfolder || '';
    this.cookieName = 'cookieName' in options ? options.cookieName : 'p';

    if (!/^\d+$/.test(this.maxPage) || this.maxPage === 0) {
        throw 'CurvyTabsPager: options.toc must be non-zero-length array OR options.maxPage must be positive integer.';
    }

    tabbedContent.paint();

    injectCSS(document, CurvyTabsPager.stylesheet);

    pagerContainer.innerHTML += CurvyTabsPager.html;

    // find first tab with `src`-less `<iframe>` that is initially visible (on load, via `style` or `class` attribute)
    var iframe = Array.prototype.find.call(tabbedContent.container.querySelectorAll('iframe:not([src])'), function(el) {
        return window.getComputedStyle(el).display !== 'none';
    });

    this.contentWindow = iframe.contentWindow;
    this.mainTab = iframe.parentElement;

    var pager = this;
    var buttonEls = pagerContainer.querySelectorAll('.page-button');
    (this.goPrevEl = buttonEls[0]).onclick = function() { pager.page(pager.num - 1); };
    (this.goNextEl = buttonEls[1]).onclick = function() { pager.page(pager.num + 1); };

    this.sliderEl = pagerContainer.querySelector('.page-slider');
    this.sliderEl.oninput = function() { pager.page(this.value); };
    this.sliderEl.onchange = this.sliderEl.oninput; // for IE 11 range control which doesn't dispatch `input` events

    var numberEls = pagerContainer.querySelectorAll('.page-number');
    this.numEl = numberEls[0]; // content to be set by page method
    (this.maxEl = numberEls[1]).innerText = this.sliderEl.max = this.maxPage;

    window.addEventListener('curvy-tabs-pager-register', registerIframeEventHandler.bind(this));
    document.addEventListener('keydown', keydownEventHandler.bind(this));

    this.page(this.num);
}

function injectCSS(document, html, id) {
    id = 'injected-stylesheet-' + (id || 'curvy-tabs-pager');
    if (!document.head.querySelector('style#' + id)) {
        var referenceElement = document.head.querySelector('style#injected-stylesheet-curvy-tabs');
        var el = document.createElement('style');
        el.id = id;
        el.innerHTML = html;
        document.head.insertBefore(el, referenceElement && referenceElement.nextElementSibling);
    }
}
function registerIframeEventHandler(e) {
    injectCSS(this.contentWindow.document, '.curvy-tab-conditional { display: none; }');

    this.contentWindow.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
        }
    });

    // Hide all conditional tabs
    this.tabBar.reset();

    // Each curvy-tab-conditional element should have a name attribute that names a conditional tab.
    // For each such element found, copy its content to the conditional tab's <body> element and then show the tab.
    var conditionalTabElements = this.contentWindow.document.getElementsByClassName('curvy-tab-conditional');
    Array.prototype.forEach.call(conditionalTabElements, function(conditionalTabEl) {
        var name = conditionalTabEl.getAttribute('name');
        var conditionalWindow = this.tabBar.getTab(name).querySelector('iframe').contentWindow;
        var conditionalWindowBody = conditionalWindow.document.body;

        conditionalWindowBody.innerHTML = conditionalTabEl.innerHTML;

        this.tabBar.show(name);
    }, this);
}

function keydownEventHandler(e) {
    var el = document.activeElement;
    var editingText = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' && el.type === 'text';

    if (!editingText ) {
        switch (e.key) {
            case 'ArrowLeft': if (this.num > 1) {
                this.page(--this.num);
            }
                break;
            case 'ArrowRight': if (this.num < this.maxPage) {
                this.page(++this.num);
            }
                break;
        }
    }
}

// Accepts integer (or string representation of itenger) or filename with (extension).
// Returns integer page number of 0 if page not found or out of range.
CurvyTabsPager.prototype.getPageNum = function(pageNumOrName) {
    var n;
    if (/^\d+$/.test(pageNumOrName)) {
        n = Number(pageNumOrName);
        if (1 > n || n > this.maxPage) {
            n = 0;
        }
    } else if (this.toc) {
        n = 1 + this.toc.findIndex(function(filename) { return pageNumOrName === filename; });
    } else {
        n = 0;
    }
    return n;
};

CurvyTabsPager.prototype.page = function(pageNumOrName, path) {
    var n = this.getPageNum(pageNumOrName);

    if (n) {
        if (path === undefined) {
            path = this.path;
        }

        this.tabBar.select(this.mainTab);

        this.num = n;

        history.pushState(null, '', location.origin + location.pathname + '?p=' + n);

        // save page number in a cookie for next visit or reload
        if (this.cookieName) {
            var d = new Date;
            d.setYear(d.getFullYear() + 1);
            document.cookie = this.cookieName + '=' + this.num + '; expires=' + d.toUTCString();
        }

        // page transition
        this.contentWindow.location.href = path + (this.toc ? this.toc[this.num - 1] : this.num + '.html');

        // adjust page panel
        this.numEl.innerText = this.sliderEl.value = this.num;

        // hide the prev button on next page
        this.goPrevEl.classList.toggle('page-button-enabled-prev', this.num !== 1);

        // hide the next button on last page
        this.goNextEl.classList.toggle('page-button-enabled-next', this.num !== this.maxPage);
    }

    return n;
};

CurvyTabsPager.stylesheet = '\n\
/* CONTENT I-FRAMES */\n\
\n\
.curvy-tabs-container iframe {\n\
    position: absolute;\n\
    top: 0;\n\
    left: 0;\n\
    width: 100%;\n\
    height: calc(100% + 16px); /* 16px counters container\'s 8px left padding + 8px right padding */\n\
    border: 0;\n\
}\n\
\n\
/* PAGE NUMBER CONTROLS */\n\
\n\
.page-number {\n\
    display: inline-block;\n\
    width: 2em;\n\
    text-align: center;\n\
}\n\
.page-slider {\n\
    margin-left: .5em;\n\
    width: 50px;\n\
    vertical-align: middle;\n\
}\n\
.page-button {\n\
    color: #d8d8d8;\n\
    user-select: none;\n\
    cursor: pointer;\n\
    border: 1px solid transparent;\n\
    border-radius: 5px;\n\
    padding: 3px 5px 1px 5px;\n\
}\n\
.page-button-enabled-prev, .page-button-enabled-next {\n\
    color: black;\n\
}\n\
.page-button-enabled:hover, .page-button-enabled:active {\n\
    border: 1px solid grey;\n\
}\n\
.page-button-enabled-prev:active {\n\
    padding-left: 3px;\n\
    padding-right: 7px;\n\
}\n\
.page-button-enabled-next:active {\n\
    padding-left: 7px;\n\
    padding-right: 3px;\n\
}';

CurvyTabsPager.html = '\n\
<span class="page-button page-button-enabled" title="Click to go to previous page (or press left-arrow key)">&#x25c0;</span>\n\
Page <input class="page-slider" type="range" min="1" max="3" value="1">\n\
<b class="page-number"></b> of <b class="page-number"></b>\n\
<span class="page-button page-button-enabled" title="Click to go to next page (or press right-arrow key)">&#x25ba;</span>\n\
';

CurvyTabsPager.version = '2.0.2';

window.CurvyTabsPager = CurvyTabsPager;
})();

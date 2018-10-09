## curvy-tabs-pager

Injects a user control for controlling paged tab bar content:

![Page control image](curvy-tabs-pager.png)

The main tab (typically the first tab) contains an `<iframe>` element that hosts the pages. Each page may contain `<div>`s with markup for other tabs with `<iframe>` elements to create the effect of paging a whole set of tabs in parallel. Tabs with no matching `<div>` are hidden, hence “conditional tabs.”

### Synopsis
Paging tab bar consists of (in any order):
* The _paging user control_ panel (required)
* A _main paging tab_ (required) - Tab A in this case
   * Represented by `<div><iframe></iframe><div>` - loaded by the pager with markup for itself and other paging tabs
   * Contains an `<iframe>` with no `src` attribute
* Zero or more _static tabs_ (optional)
   * Represent by `<div>arbitrary static content</div>`
   * May include an `<iframe>` but it must have a `src` attribute (to differentiate it from the main tab)
* Zero or more _conditional paging tabs_ (optional)
   * Must have class `curvy-tab-conditional`
   * Content of these tabs is included in main tab's markup in a similar element (same `class` and `name` attributes)
   * When no such element is found in main tab's markup, this tab is hidden
#### Markup
```html
<div id="page-panel" style="position:absolute; top:48px; right:24px;">
  <!-- Injected with the paging user control. -->
</div>

<div class="curvy-tabs-container">
  <div style="background-color:lightblue" name="Tab A">
    <!-- This is the main paging tab: Always visible. Has an `<iframe>` with no initial `src` value. -->
    <iframe></iframe>
    <!-- This `<iframe>`'s markup may (or may not) include divs with content for conditional tabs. -->
  </div>

  <div style="background-color:lightcyan" name="Notes">
    This is a tab with static content (no iframe).
    There may be 0 or more of these peppered throughout.
    While Tab A's content (and hence and Tab B's content) pages, this tab stays the same.
  </div>

  <div class="curvy-tab-conditional" style="background-color:lightcyan" name="Tab B">
    <!--
      This is a conditional tab.
      There may be 0 or more of these peppered throughout.
      It is paged in parallel with the main tab.
      Content comes from element in the markup of the main tab with same `class` and `name` as the tab.
      If no such element is found in the main tab's markup, the tab is hidden.
    -->
    <iframe src="blank.html"></iframe>
  </div>
</div>
```
#### Instantiate the pager
```js
var options = { toc, maxPage, startPage, path }; // required: toc or maxPage
var myPager = new CurvyTabsPager(pagerContainer, tabbedContent, options);
```
* Injects a `<style>` element into `<head>` which:
   * styles paging user control
   * stretches `<iframe>` to fit tab content area
* Injects the paging user control markup into given container element `pagerContainer`
* Wires the user control up to the `CurvyTabs` tab bar given in `tabbedContent`

In addition to the user interacting with the paging user control, the [`myPager.page(pageNumberOrName)`](#curvytabsprototypepagepagenumberorname-path-method) method may be called to programmatically switch between pages.

#### Main tab page script
Pages loaded into the main tab’s `<iframe>` must register with the pager in the parent window:
```js
parent.dispatchEvent(new CustomEvent('curvy-tabs-pager-register', { detail: { window: window }}));
```
> Note: If you wish to maintain compatibility with **IE 11**, your script must also include the [`CustomEvent` polyfill](https://developer.mozilla.org/docs/Web/API/CustomEvent/CustomEvent#Polyfill).

#### Conditional tab iframe source markup
Conditional tabs typically source a local `blank.html` that `<link>`s to a local CSS stylesheet to style the page content:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="myPageContentStylesheet.css">
</head>
</html>
```
#### Main tab’s markup for conditional tab content
For each conditional tab to be shown, markup is placed in an element in the main tab’s page with the same class and name as the tab:
```html
<div class="curvy-tab-conditional" name="Tab B">
    This markup is copied to Tab B's `<iframe>`'s `<body>`!
</div>
```
Because there’s no `<div class="curvy-tab-conditional" name="Tab C">…</div>` in this example markup, Tab C is hidden.

### Description

#### Constructor
The `CurvyTabsPager` constructor creates a user control which it injects into the given `pagerContainer` element. This lets the user navigate pages which are displayed in multiple tabs of a `CurvyTabs` tab bar (given in the `tabbedContent` parameter).

The page’s filenames are given in the `options.toc` array. These filenames are prefixed with the path given in `options.path`. Table of contents is optional. If not given, files are referenced by page number instead: `path/1.html`, `path/2.html`, _etc.,_ through page `options.maxPage` (which must be given when `options.toc` is not).

The first page shown is the page number or page name in `options.startPage`. If not given, loads the first page listed in the table of contents. If there’s no table of contents, loads page `path/1.html`.

#### User control interface
The paging user control features:
* Previous page and next page icons;
* a range control (slider);
* displays page number as "Page _m_ of _n_"; and
* listeners for `ArrowLeft` and `ArrowRight` keydown events.

#### Pages
The start page is loaded into the main tab’s `<iframe>` as described above.

All pages loaded into the main tab must register with the parent window as shown in the synopsis above. That line would typically be included in a common script loaded by all pages. The registration forwards `ArrowLeft` and `ArrowRight` keyboard events to the pager and processes conditional tab content.

#### Conditional tabs
As outlined above, all content for all conditional tabs is included in the main tab's markup. The main tab’s `<iframe>` is loaded by the HTTP response. The _conditional tab(s)_  (_e.g.,_ `<div class="curvy-tab-conditional" name="Tab Name">...</div>`) are loaded programmatically with the contents of hidden elements with same `class` and `name` found in the main tab. These tabs are become visible; all other conditional tabs are hidden.

### Dependency
The constructor takes a [`CurvyTabs`](#see-also) object (v2.3.1 or higher) as a required second parameter (`tabbedContent` in the synopsis above).

### Distribution
Published in two formats:

* An npm module published on the npm Registry (npmjs.org), for developer use at build time:
   ```js
   var CurvyTabsPager = require('curvy-tabs-pager');
   ```
* A script to be loaded by the client at run-time (sets global `CurvyTabsPager`), either of:
   ```html
   <script src="https://unpkg.com/curvy-tabs-pager@2.0/umd/curvy-tabs-pager.js"></script>
   <script src="https://unpkg.com/curvy-tabs-pager@2.0/umd/curvy-tabs-pager.min.js"></script>
   ```
   Any [SEMVER](//semver.org) string can be used. `2.0` in the above means load the latest of the 2.0.* range. See the [npm semver calculator](//semver.npmjs.com) and npm’s [semantic versioning](https://docs.npmjs.com/misc/semver) page.

### API

#### `CurvyTabsPager` constructor

Given a [`curvy-tabs`](https://github.com/joneit/curvy-tabs) instance:
```js
var tabbedContentContainer = document.querySelector('.curvy-tabs-container'); // or whatever
var tabbedContent = new CurvyTabs(tabbedContentContainer);
tabBar.paint();
```
The following instantiates a `CurvyTabsPager` object (values are illustrative):
```js
var pagerContainer = document.getElementById('page-panel');
var options = { // required: toc or maxPage; the rest are optional
    toc: ['Synopsis.html', 'Description.html', 'See Also.html'],
    maxPage: 3, // file names are 1.html, 2.html, 3.html.; ignored if `toc` given
    startPage: 12, // may be page number or file name; omit for default (first page: Synopsis.html or 1.html)
    path: 'content/', // omit or falsy value or './' for default (no path prefixed)
    cookieName: 'page' // omit for default ('p'); falsy value means don’t set cookie
};

var myPager = new CurvyTabsPager(
    pagerContainer, // required
    tabbedContent,  // required
    options         // required; must have `toc` or `maxPage`
);
```

#### `CurvyTabs.prototype.getPageNum(pageNumberOrName)` method

Accepts either:
* A 1-based integer page number (or string representation thereof); or
* A filename listed in the table of contents array

Returns:
* Integer page number
* 0 if given integer is out of range **or** given filename not found in table of contents

Examples:
```js
myPager.getPageNum(2);  // returns 2
myPager.getPageNum('2');  // returns 2
myPager.getPageNum('99');  // returns 0 (out of range)
myPager.getPageNum('-3');  // returns 0 (out of range)
myPager.getPageNum('Description.html'); // returns 2 (not integer but found in ToC)
myPager.getPageNum('Splat.html'); // returns 0 (not integer AND not found in ToC)
myPager.getPageNum('2.5');  // returns 0 (not integer AND not found in ToC either)
```

#### `CurvyTabs.prototype.page(pageNumberOrName, path)` method

To go to a page programmatically:
```js
myPager.page(2);  // go to 2nd page (1-based)
myPager.page('Description.html'); // also goes to 2nd page
```

This method performs the following actions:
* Navigates iframe to the new page
* Displays new page number
* Disables previous page icon if first page
* Disables next page icon if last page
* Repositions range control
* Processes conditional tab content and shows/hides them as needed

Fails silently if page does not exist.

#### Button elements

The following instance variables reference DOM elements:

Variable | Description
-------- | -----------
`myPager.goFirstEl` | First page button
`myPager.goPrevEl` | Next page button
`myPager.goNextEl` | Previous page button
`myPager.goLastEl` | Final page button
`myPager.sliderEl` | Page range control
`myPager.numEl` | Current page number
`myPager.maxEl` | Final page number

For example, to hide the first and final buttons:
```js
myPager.goFirstEl.style.display = myPager.goLastEl.style.display = 'none';
```

#### `CurvyTabsPager.version` static property

Contains the version string `2.0.7` (major.minor.patch with no leading `v`).

#### `CurvyTabsPager.stylesheet` and `CurvyTabsPager.html` static properties

The stylesheet and the markup to be injected may be overridden if desired by setting these static properties before instantiation.

## See Also
* `curvy-tabs` ([npm](https://npmjs.org/package/curvy-tabs), [github](https://github.com/joneit/curvy-tabs))

## Version History
* `2.0.7`
   * IE 11 issue: Avoid 2-param overload of DOMTokenList.prototype.toggle
* `2.0.6`
   * Substitute `25c4` for `25c0` on Windows to get a better "previous" and "first" (left arrow) icons
* `2.0.5`
   * Add first page and last page buttons
   * Document instance variables that reference DOM elements
   * Retire `page-button-enabled-next` and `page-button-enabled-prev` CSS classes
* `2.0.4`
   * Update README.md with correct `<script>` tag snippet
* `2.0.3`
   * Update build.sh to create `umd` folder for `unpkg.com` CDN support for this and all future versions. See revised installation snippet above. (`curvy-tabs-pager.github.io` will no longer be updated with new versions, although previous versions will remain there.)
* `2.0.2` (9/26/2018)
   * `options.startPage` now correctly accepts a page file name (as well as a page number)
   * As user pages through tutorial, browser's query string is updated with `?p=n` (where _n_ = page number)
* `2.0.1` (9/13/2018)
   * Fix defect in copying conditional tab content
   * Rename `options.subfolder` to `options.path` (however `options.subfolder` is still accepted for backwards compatibility)
* `2.0.0` (9/12/2018)
   * Remove `toc`, `startPage`, and `subfolder` instantiation parameters in favor of a single `options` object parameter with those keys
   * Add `options.maxPage` which can be given in place of `options.toc` in which case file names are the page numbers themselves (`path/1.html`, `path/2.html`, _etc._)
* `1.0.0` (9/11/2018)
   *  Initial release

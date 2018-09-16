mkdir build 2>/dev/null

echo '(function(){' > build/curvy-tabs-pager.js
sed 's/module.exports =/window.CurvyTabsPager =/' index.js >> build/curvy-tabs-pager.js
echo '})();' >> build/curvy-tabs-pager.js

uglifyjs build/curvy-tabs-pager.js -cmo build/curvy-tabs-pager.min.js

ls -lahL build
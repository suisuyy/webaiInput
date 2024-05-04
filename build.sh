echo '(() => {'  >./dist/index.js

cat index.js >>./dist/index.js

echo '})();' >> ./dist/index.js

cp esltool.js dist/
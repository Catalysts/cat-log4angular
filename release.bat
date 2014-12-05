cd dist
git fetch
git reset --hard origin/master
cd ..
call gulpw release
cd dist
git add .
git commit -m %*
git tag %*
git push
git push origin tags/%*
cd ..
git add .
git commit -m %*
git tag %*
git push
git push origin tags/%*
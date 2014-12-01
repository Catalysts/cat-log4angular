cd dist
git fetch
git reset --hard origin/master
cd ..
call gulpw release
cd dist
git commit -a -m %*
git tag %*
cd ..
git commit -a -m %*
git tag %*
cd dist
git push
git push origin tags/%*
cd ..
git push
git push origin tags/%*
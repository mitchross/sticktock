#!/bin/bash

TAG="$(date +%Y-%m-%d_%H-%M)"

function build_n_tag() {
  image="$1"
  build_ctx="$2"
  echo
  echo "   ======================================================"
  echo "   | 🏗️  Building image $image from $build_ctx"
  echo "   ======================================================"
  docker build --no-cache -t $image:$TAG $build_ctx || return $?
  docker tag $image:$TAG $image:latest || return $?
}

for build_cmd in $@
do
  case $build_cmd in
    --build-webapp) build_n_tag sticktock-webapp ./frontend/ || exit $? ;;
    --build-api) build_n_tag sticktock-api ./backend-api/ || exit $? ;;
    *) echo "❌  Unrecognized argument $build_cmd" ; exit 1;;
  esac
done

STACK="sticktock"
STACK_YML="docker-swarm-stack.yml"

# need to make this cleaner, and leave explainer why this simple thingy
echo
echo "🏁 stopping stack $STACK"
docker stack rm $STACK

echo
echo "😴 and resting a bit for all to rest down"
sleep 5

echo
echo "🏁 starting stack $STACK"
docker stack deploy --detach=false -c $STACK_YML $STACK || exit $?
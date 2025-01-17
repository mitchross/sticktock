# StickTock

## Configuration

### Prerequisits

One needs docker installed, set into swarm mode. All build tools are located in images, so you don't really need any local tooling for infrequent changes. Otherwise, look into `Dockerfile` and `package.json` files for scripts that build, run, and run-in-dev mode given code.

### Your own domains

`frontend` next.js web app needs explicit information about it's own domain, and domain of api server.
These values must be set in `frontend/service.config.ts`.
Incorrect domains give you unpleasant debugging.

Backend service can work with frontends from different domains.

### Data folder on backend

Docker stack/compose file `docker-swarm-stack.yml` shows that `backend-api` needs a mounted volume for its internal data place `/var/local/sticktock/`. You can use bind, like it is used now, or some other volume. If mount fails, `docker stack deploy` may be kinda silent about it, so, check `docker service ls`.

## Building and running

Use `reload-stack.sh --build-webapp --build-app`. If one of images doesn't have to be recreated anew, skip respective flag.

Generic form of stack file uses `latest` images, but run labels images with date and time to be able to rollback manually.

To stop stack, do usual `docker stack rm sticktock`.


## License

This project is licensed under the GNU AGPLv3 License

## Credits

This repository is based code from separate [frontend](https://github.com/PrivacySafe/original-sticktock) and [backend](https://github.com/PrivacySafe/original-sticktock-api) repositories, forked from respective offtiktok repositories.

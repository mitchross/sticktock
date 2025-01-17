<p align="center">
  <a href="https://sticktock.com"><img src="sticktock-wordmark.svg" width="500" height="auto" /></a>
</p>

# StickTock &ndash; Share TikToks Safely. No Ads, No Spying, No Phone App.

StickTock is 100% free and open source software (FOSS) developed by privacy advocates. StickTock allows users to view, share, and download TikTok videos without exposing themselves to invasive tracking. Anyone with a web browser can now watch TikToks while protecting their privacy: [StickTock.com](https://sticktock.com)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R1194HN7)

[![liberapay](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/PrivacySafe/donate)

## Alpha Release Announcement

* [January 17, 2025 Announcement of StickTock.com](
https://bitsontape.com/sticktock-share-tiktok-videos)

### Known Issues
* **Links that go out to TikTok.com: ** Non-video links still persist in the UI that go out to tiktok.com  These links, for example to user profiles, will probably never work in StickTock.com  We are working on an intermediary warning screen.


## Features

- **Link Conversion**: Convert TikTok video URLs into StickTock videos just by replacing the word `tiktok.com` with `sticktock.com`
- **Tor Compatible**: Tested with [Tor Browser](https://torproject.org/download) and works with Tor hidden services.

## Free Public Server

* Browse to https://sticktock.com to try this software for free.
* **Tor Hidden Service:** [b7vypdv52igjfg7vwhlofny45koaa4ltletx67ranlwfotiiqwza2eyd.onion](http://b7vypdv52igjfg7vwhlofny45koaa4ltletx67ranlwfotiiqwza2eyd.onion)

## Getting Started

As our logo hints, StickTock is a “band aid” solution. We can’t promise it will persist long after the TikTok ban, but we made it easy to deploy by sysadmins and fork by developers. As the US population scrambles to find access to TikTok videos, we hope StickTock will call attention to the vital importance of free speech and digital independence.

### Configuration

### Prerequisites

You need docker installed and set into swarm mode. All build tools are located in the images, so you don't really need any local tooling for infrequent changes. Read `Dockerfile` and `package.json` files for scripts that build, run, and run-in-dev mode given code.

### Domains

The `frontend` next.js web app needs explicit information about its own domain and the domain of the API server.

These values must be set in `frontend/service.config.ts`.

Incorrect domains will give you unpleasant debugging.

The backend service can work with frontends from different domains.

### Data Folder on Backend

The docker stack/compose file `docker-swarm-stack.yml` shows that `backend-api` needs a mounted volume for its internal data location `/var/local/sticktock/`. You can use bind, like it is used now, or some other volume. If mount fails `docker stack deploy` may not be verbose about errors, so be sure to check `docker service ls`.

## Building &amp; Running

Use `reload-stack.sh --build-webapp --build-app`. If one of the images doesn't need to be recreated anew, skip the respective flag.

The generic form of the stack file uses `latest` images, but run labels images with date and time to be able to rollback manually.

To stop stack, do the usual `docker stack rm sticktock`.

## License
© 2025-present PrivacySafe Services LLC. This project is dedicated to ethical <a href="https://fsf.org" target="_blank" rel="noreferrer noopener">Free and Open Source Software</a> and <a href="https://oshwa.org" target="_blank" rel="noreferrer noopener">Open Source Hardware</a>. PrivacySafe® is a registered trademark.

Released under the [GNU AGPLv3 License](LICENSE). See [LICENSE](LICENSE) for more information. StickTock is modified from [offtiktok](https://github.com/MarsHeer/offtiktok) and [offtiktokapi](https://github.com/MarsHeer/offtiktokapi) released under the MIT/Expat License by MarsHeer.

### Disclaimer of Warranty.

THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

### Limitation of Liability.

IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS
THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY
GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE
USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF
DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),
EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.

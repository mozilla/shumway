Useful third-party tools
========================

The utils/ dir should contain third-party tools from Adobe to help
with the development process. In here, you should have:

 * A debugger build of avmshell

When debugging an AVM2 problem in Shumway, it's useful to have the real
AVM2 around. Surprisingly, the official AVM2 used in Adobe is actually
open-source: it was donated to Mozilla as [tamarin](http://hg.mozilla.org/tamarin-redux).
The actual project has issues building with recent versions of gcc, so
I prefer to grab a build from Adobe themselves. They can be found in the
[Mozilla FTP](ftp://ftp.mozilla.org/pub/js/tamarin/builds/tamarin-redux/7336-70c2f9c0ea92/).

 * A version of the ActionScript compiler, ASC

Open-sourced as part of the Flex SDK, recently donated to Apache, it can
be found in [Mozilla's FTP as well](ftp://ftp.mozilla.org/pub/js/tamarin/builds/asc/latest/).

 * A recent standalone build of SpiderMonkey

I have no idea where to get that one.

tl;dr
-----

    $ cd avm2/
    $ curl ftp://ftp.mozilla.org/pub/js/tamarin/builds/tamarin-redux/7336-70c2f9c0ea92/linux/avmshell_d_64 > utils/avmshell
    $ curl ftp://ftp.mozilla.org/pub/js/tamarin/builds/asc/latest/asc.jar > utils/asc.jar


    $ cd bin/

    $ export ASC=../utils/asc.jar
    $ export BUILTINABC=../generated/builtin/builtin.abc
    $ python shu.py asc ../tests/sunspider/crypt-aes.as

    $ ../utils/js ../bin/avm.js ../tests/sunspider/crypto-aes.abc
    $ ../utils/avmshell_d_64 -Dverbose=interp -Dinterp ../tests/sunspider/crypto-aes.abc

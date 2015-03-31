[![Build Status](https://travis-ci.org/mozilla/shumway.svg?branch=master)](https://travis-ci.org/mozilla/shumway)

# Shumway

Shumway is an HTML5 technology experiment that explores building a faithful
and efficient renderer for the SWF file format without native code
assistance.

Shumway is community-driven and supported by Mozilla. Our goal is to
create a general-purpose, web standards-based platform for parsing and
rendering SWFs. Integration with Firefox is a possibility if the experiment
proves successful.

# Getting started

### Online demo

For an online demo, visit:

+ http://mozilla.github.io/shumway/examples/racing/
+ Or see all the demos at http://mozilla.github.io/shumway/

### Extension

Install the Firefox extension: http://mozilla.github.io/shumway/extension/firefox/shumway.xpi

This development extension should be quite stable but still might break from time to time.
Also, note that the development extension is updated on every merge and by default Firefox will
auto-update extensions on a daily basis (you can change this through the 
`extensions.update.interval` option in `about:config`, time is in seconds).

To build the Firefox extension: use `grunt firefox`.

## Contributing

### Development
[See the wiki](https://github.com/mozilla/shumway/wiki).

If you don't want to hack on the project or have little spare time, __you still
can help!__ Just install the Firefox extension, test it on SWFs in the wild,
and report any problems or unimplemented features.

Our GitHub contributors so far:

+ https://github.com/mozilla/shumway/contributors

You can add your name to it! :)

The easiest way to get started is to [grep for TODOs](https://github.com/mozilla/shumway/search?q=TODO&ref=cmdform) and implement them.

# Additional resources

Talk to us on IRC:

+ #shumway on irc.mozilla.org

Post on our mailing list:

+ dev-shumway@lists.mozilla.org

Subscribe either using lists.mozilla.org or Google Groups: 
  
+ https://lists.mozilla.org/listinfo/dev-shumway
+ http://groups.google.com/group/mozilla.dev.shumway

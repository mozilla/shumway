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

+ http://mozilla.github.com/shumway/examples/racing/
+ Or see all the demos at http://mozilla.github.com/shumway/

### Extension

The Firefox extension is availble at http://mozilla.github.com/shumway/extension/firefox/shumway.xpi

This development extension should be quite stable but still might break from time to time.
Also, note that the development extension is updated on every merge and by default Firefox will
auto-update extensions on a daily basis (you can change this through the 
`extensions.update.interval` option in `about:config`).

### Getting the source

The source code for Shumway and its submodules can be cloned the following way:

    cd ~
    git clone --recursive https://github.com/mozilla/shumway.git Shumway


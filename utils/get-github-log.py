#! /usr/bin/env python
# taken from https://gist.github.com/brendandahl/4656584
"""\
%prog [options] <last pull request number>

      Helper script to generate release notes from github pull request titles.
"""

import json
import urllib2
from optparse import OptionParser

class ReleaseOptions(OptionParser):
    def __init__(self, **kwargs):
        OptionParser.__init__(self, **kwargs)
        self.add_option("-n", "--num_pages", dest="num_pages", type="int",
                help="Number of pages to search. [%default]", default=2)

        self.set_usage(__doc__)

    def verify_options(self, options, args):
        if len(args) < 1:
            self.print_help()
            exit(-1)

        return options

def parse_date(string_date):
  from datetime import datetime
  try:
      date = datetime.strptime(string_date, '%Y-%m-%dT%H:%M:%SZ')
  except TypeError:
      date = None
  return date

option_parser = ReleaseOptions()
options, args = option_parser.parse_args()
option_parser.verify_options(options, args)

num_pages = options.num_pages
last_pr = args[0]

prs = []

for x in range(0, num_pages):
  url = 'https://api.github.com/repos/mozilla/shumway/pulls?page=' + str(x + 1) + '&per_page=100&state=closed'
  content = urllib2.urlopen(url).read()

  prs = prs + json.loads(content)

prs = sorted(prs, key=lambda k: k['merged_at'])
print "Searching " + str(len(prs)) + " total prs:"

last_found = False
for pr in prs:
  if last_found and pr['merged_at'] != None:
    print '#' + str(pr['number']) + ' ' + pr['title']
  if str(pr['number']) == last_pr:
    last_found = True

if not last_found:
  print 'ERROR: never found last PR.'

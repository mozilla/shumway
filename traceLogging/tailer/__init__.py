import re
import time

class Tailer(object):
    """\
    Implements tailing and heading functionality like GNU tail and head
    commands.
    """
    line_terminators = ('\r\n', '\n', '\r')

    def __init__(self, file, read_size=1024, end=False):
        self.read_size = read_size
        self.file = file
        self.start_pos = self.file.tell()
        if end:
            self.seek_end()
    
    def splitlines(self, data):
        return re.split('|'.join(self.line_terminators), data)

    def seek_end(self):
        self.seek(0, 2)

    def seek(self, pos, whence=0):
        self.file.seek(pos, whence)

    def read(self, read_size=None):
        if read_size:
            read_str = self.file.read(read_size)
        else:
            read_str = self.file.read()

        return len(read_str), read_str

    def seek_line_forward(self):
        """\
        Searches forward from the current file position for a line terminator
        and seeks to the charachter after it.
        """
        pos = start_pos = self.file.tell()

        bytes_read, read_str = self.read(self.read_size)

        start = 0
        if bytes_read and read_str[0] in self.line_terminators:
            # The first charachter is a line terminator, don't count this one
            start += 1

        while bytes_read > 0:          
            # Scan forwards, counting the newlines in this bufferfull
            i = start
            while i < bytes_read:
                if read_str[i] in self.line_terminators:
                    self.seek(pos + i + 1)
                    return self.file.tell()
                i += 1

            pos += self.read_size
            self.seek(pos)

            bytes_read, read_str = self.read(self.read_size)

        return None

    def seek_line(self):
        """\
        Searches backwards from the current file position for a line terminator
        and seeks to the charachter after it.
        """
        pos = end_pos = self.file.tell()

        read_size = self.read_size
        if pos > read_size:
            pos -= read_size
        else:
            pos = 0
            read_size = end_pos

        self.seek(pos)

        bytes_read, read_str = self.read(read_size)

        if bytes_read and read_str[-1] in self.line_terminators:
            # The last charachter is a line terminator, don't count this one
            bytes_read -= 1

            if read_str[-2:] == '\r\n' and '\r\n' in self.line_terminators:
                # found crlf
                bytes_read -= 1

        while bytes_read > 0:          
            # Scan backward, counting the newlines in this bufferfull
            i = bytes_read - 1
            while i >= 0:
                if read_str[i] in self.line_terminators:
                    self.seek(pos + i + 1)
                    return self.file.tell()
                i -= 1

            if pos == 0 or pos - self.read_size < 0:
                # Not enought lines in the buffer, send the whole file
                self.seek(0)
                return None

            pos -= self.read_size
            self.seek(pos)

            bytes_read, read_str = self.read(self.read_size)

        return None
  
    def tail(self, lines=10):
        """\
        Return the last lines of the file.
        """
        self.seek_end()
        end_pos = self.file.tell()

        for i in xrange(lines):
            if not self.seek_line():
                break

        data = self.file.read(end_pos - self.file.tell() - 1)
        if data:
            return self.splitlines(data)
        else:
            return []
               
    def head(self, lines=10):
        """\
        Return the top lines of the file.
        """
        self.seek(0)

        for i in xrange(lines):
            if not self.seek_line_forward():
                break
    
        end_pos = self.file.tell()
        
        self.seek(0)
        data = self.file.read(end_pos - 1)

        if data:
            return self.splitlines(data)
        else:
            return []

    def follow(self, delay=1.0):
        """\
        Iterator generator that returns lines as data is added to the file.

        Based on: http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/157035
        """
        trailing = True       
        
        while 1:
            where = self.file.tell()
            line = self.file.readline()
            if line:    
                if trailing and line in self.line_terminators:
                    # This is just the line terminator added to the end of the file
                    # before a new line, ignore.
                    trailing = False
                    continue

                if line[-1] in self.line_terminators:
                    line = line[:-1]
                    if line[-1:] == '\r\n' and '\r\n' in self.line_terminators:
                        # found crlf
                        line = line[:-1]

                trailing = False
                yield line
            else:
                trailing = True
                self.seek(where)
                time.sleep(delay)

    def __iter__(self):
        return self.follow()

    def close(self):
        self.file.close()

def tail(file, lines=10):
    """\
    Return the last lines of the file.

    >>> import StringIO
    >>> f = StringIO.StringIO()
    >>> for i in range(11):
    ...     f.write('Line %d\\n' % (i + 1))
    >>> tail(f, 3)
    ['Line 9', 'Line 10', 'Line 11']
    """
    return Tailer(file).tail(lines)

def head(file, lines=10):
    """\
    Return the top lines of the file.

    >>> import StringIO
    >>> f = StringIO.StringIO()
    >>> for i in range(11):
    ...     f.write('Line %d\\n' % (i + 1))
    >>> head(f, 3)
    ['Line 1', 'Line 2', 'Line 3']
    """
    return Tailer(file).head(lines)

def follow(file, delay=1.0):
    """\
    Iterator generator that returns lines as data is added to the file.

    >>> import os
    >>> f = file('test_follow.txt', 'w')
    >>> fo = file('test_follow.txt', 'r')
    >>> generator = follow(fo)
    >>> f.write('Line 1\\n')
    >>> f.flush()
    >>> generator.next()
    'Line 1'
    >>> f.write('Line 2\\n')
    >>> f.flush()
    >>> generator.next()
    'Line 2'
    >>> f.close()
    >>> fo.close()
    >>> os.remove('test_follow.txt')
    """
    return Tailer(file, end=True).follow(delay)

def _test():
    import doctest
    doctest.testmod()

def _main(filepath, options):
    tailer = Tailer(open(filepath, 'rb'))

    try:
        try:
            if options.lines > 0:
                if options.head:
                    if options.follow:
                        print >>sys.stderr, 'Cannot follow from top of file.'
                        sys.exit(1)
                    lines = tailer.head(options.lines)
                else:
                    lines = tailer.tail(options.lines)
        
                for line in lines:
                    print line
            elif options.follow:
                # Seek to the end so we can follow
                tailer.seek_end()

            if options.follow:
                for line in tailer.follow(delay=options.sleep):
                    print line
        except KeyboardInterrupt:
            # Escape silently
            pass
    finally:
        tailer.close()

def main():
    from optparse import OptionParser
    import sys

    parser = OptionParser(usage='usage: %prog [options] filename')
    parser.add_option('-f', '--follow', dest='follow', default=False, action='store_true',
                      help='output appended data as  the  file  grows')

    parser.add_option('-n', '--lines', dest='lines', default=10, type='int',
                      help='output the last N lines, instead of the last 10')

    parser.add_option('-t', '--top', dest='head', default=False, action='store_true',
                      help='output lines from the top instead of the bottom. Does not work with follow')

    parser.add_option('-s', '--sleep-interval', dest='sleep', default=1.0, metavar='S', type='float',
                      help='with  -f,  sleep  for  approximately  S  seconds between iterations')

    parser.add_option('', '--test', dest='test', default=False, action='store_true',
                      help='Run some basic tests')

    (options, args) = parser.parse_args()

    if options.test:
        _test()
    elif not len(args) == 1:
        parser.print_help()
        sys.exit(1)
    else:
        _main(args[0], options)

if __name__ == '__main__':
    main()
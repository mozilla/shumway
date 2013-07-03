/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf ZombotronTest,100,100,10 test/swfs/ZombotronTest.as
*/

package {
    import flash.display.MovieClip;
    import flash.net.SharedObject;
    import flash.text.TextField;
    import flash.utils.getQualifiedSuperclassName;

    public class ZombotronTest extends MovieClip {
        public function ZombotronTest() {
            stop();
            trace('Init frame1 script');
            addFrameScript(0, frame1);
        }

        private function testDisplayObjectName(): void {
            trace('DisplayObject.name');
            var obj1: TextField = new TextField();
            var obj2: TextField = new TextField();
            var name1 = obj1.name;
            var name2 = obj2.name;
            trace('non-empty: ' + (name1 != ''));
            trace('unique: ' + (name1 != name2));
        }

        private function testFunctionSuperName(): void {
            trace('Function\'s super: ' +
              getQualifiedSuperclassName(testFunctionSuperName));
        }

        private function testSharedObjectInvoke(): void {
            trace('SharedObject');
            var obj: SharedObject = SharedObject.getLocal('test');
            trace('field1 emtpy: ' + (obj.data.field1 === undefined));
            obj.data.field1 = 'test';
            trace('field1 empty: ' + (obj.data.field1 === undefined));
            trace('field1 size non-zero: ' + (obj.size > 0));
            obj.clear();
            trace('field1 empty: ' + (obj.data.field1 === undefined));
            obj.flush();
        }

        private function testTextField(): void {
            trace('TextField');
            var textField = new TextField();
            trace('embedFonts: ' + textField.embedFonts);
            trace('length: ' + textField.length);
            textField.appendText('text');
            trace('numLines: ' + textField.numLines);
            trace('length: ' + textField.length);
        }

        private function frame1(): void {
            trace('frame1 script');

            testFunctionSuperName();
            testDisplayObjectName();
            testSharedObjectInvoke();
            testTextField();
        }
    }
}


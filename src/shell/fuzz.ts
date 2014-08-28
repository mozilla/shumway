module Shumway.Shell.Fuzz {
  export class Mill {
    private _writer: IndentingWriter;
    private _kind: String;
    constructor(writer: IndentingWriter, kind: string) {
      this._writer = writer;
      this._kind = kind;
    }
    public fuzz() {
      Random.seed(Date.now());
      for (var i = 0; i < 1; i++) {
        writeSWF(this._writer, randomNumber(10, 17));
      }
    }
  }

  function randomNumber(min: number, max: number, exclude: number = Infinity) {
    do {
      var value = Math.floor(Math.random() * (max - min + 1)) + min
    } while (value === exclude);
    return value;
  }

  function makeRandomNumber(min: number, max: number) {
    return randomNumber.bind(null, min, max);
  }


  function probaility(value: number): boolean {
    return Math.random() <= value;
  }

  function writeSWF(writer: IndentingWriter, version: number) {
    writer.enter('<swf version="' + version + '" compressed="1">');
    writeHeader(writer);
    writer.leave('</swf>');
  }


  function writeHeader(writer: IndentingWriter) {
    var frameCount = randomNumber(10, 100);
    writer.enter('<Header framerate="120" frames="' + frameCount + '">');

    writer.enter('<size>');
    writer.writeLn('<Rectangle left="0" right="2000" top="0" bottom="2000"/>');
    writer.leave('</size>');

    writer.enter('<tags>');
    writer.writeLn('<FileAttributes hasMetaData="1" allowABC="0" suppressCrossDomainCaching="0" swfRelativeURLs="0" useNetwork="0"/>');

    var frameCount = randomNumber(1, 32);
    for (var i = 0; i < frameCount; i++) {
      writeFrame(writer, true, frameCount, -1);
    }

    writeActions(writer, makeFSCommandQuit);
    writer.writeLn('<ShowFrame/>'); // Need a show frame here for this to execute.

    writer.leave('</tags>');
    writer.leave('</Header>');
  }

  function makeSequenceWriter(sequence: any []) {
    return function (writer: IndentingWriter) {
      for (var i = 0; i < sequence.length; i++) {
        sequence[i](writer);
      }
    }
  }

  function writeDefineSprite(writer: IndentingWriter, id: number, frameCount: number) {
    writer.enter('<DefineSprite objectID="' + id + '" frames="' + frameCount + '">');
    writer.enter('<tags>');
    for (var i = 0; i < frameCount; i++) {
      writeFrame(writer, false, frameCount, id);
    }
    writer.leave('</tags>');
    writer.leave('</DefineSprite>');
  }

  var spriteCount = 1;

  function writeFrame(writer: IndentingWriter, root: boolean, frameCount: number, id: number) {
    if (probaility(0.5)) {
      var sequence = [
        writeTraceCurrentFrameAction
      ];
      if (!root) {
        sequence.push(makeGotoFrameAction(makeRandomNumber(0, frameCount)));
      }
      writeActions(writer, makeSequenceWriter(sequence));
    }

    if (probaility(0.5) && (spriteCount - 1 !== id)) {
      writePlaceObject2(writer, randomNumber(0, 1024), randomNumber(1, spriteCount - 1, id));
    }
    writer.writeLn('<ShowFrame/>');
    if (root) {
      if (probaility(0.3)) {
        writeDefineSprite(writer, spriteCount ++, randomNumber(5, 10));
      }
    }
  }

  function writeActions(writer: IndentingWriter, actionsWriter) {
    writer.enter('<DoAction>');
    writer.enter('<actions>');
    actionsWriter(writer);
    writer.writeLn('<EndAction/>');
    writer.leave('</actions>');
    writer.leave('</DoAction>');
  }

  function writePlaceObject2(writer: IndentingWriter, depth: number, id: number) {
    writer.enter('<PlaceObject2 replace="0" depth="' + depth + '" objectID="' + id + '">');
    writer.enter('<transform>');
    writer.writeLn('<Transform transX="0" transY="0"/>');
    writer.leave('</transform>');
    writer.leave('</PlaceObject2>');
  }

  function makeGotoFrameAction(frameNumber: any) {
    return function (writer: IndentingWriter) {
      // writer.writeLn('<GotoFrame frame="' + frameNumber() + '"/>');
    }
  }

  function makeFSCommandQuit(writer: IndentingWriter) {
    writer.writeLn('<GetURL url="FSCommand:quit" target=""/>');
  }

  function writeTraceCurrentFrameAction(writer: IndentingWriter) {
    writer.writeLn('<PushData>');
    writer.writeLn('  <items>');
    writer.writeLn('    <StackString value="this"/>');
    writer.writeLn('  </items>');
    writer.writeLn('</PushData>');
    writer.writeLn('<GetVariable/>');
    writer.writeLn('  <PushData>');
    writer.writeLn('    <items>');
    writer.writeLn('      <StackString value="_currentframe"/>');
    writer.writeLn('    </items>');
    writer.writeLn('  </PushData>');
    writer.writeLn('<GetMember/>');
    writer.writeLn('<Trace/>');

  }
}
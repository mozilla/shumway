import flash.utils.ByteArray;

var data = new ByteArray();

data.writeUTFBytes('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc hendrerit, risus vel dapibus hendrerit, augue ipsum adipiscing lorem, quis orci aliquam.');
trace(data.length);
data.deflate();
trace(data.length);
data.inflate();
trace(data.length);
trace(data.readUTFBytes(150));

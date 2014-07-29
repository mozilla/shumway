var fs         = require('fs');
var mysql      = require('mysql');
var tags = [
  "CSM_TEXT_SETTINGS",
  "DEFINE_BINARY_DATA",
  "DEFINE_BITS",
  "DEFINE_BITS_JPEG2",
  "DEFINE_BITS_JPEG3",
  "DEFINE_BITS_JPEG4",
  "DEFINE_BITS_LOSSLESS",
  "DEFINE_BITS_LOSSLESS2",
  "DEFINE_BUTTON",
  "DEFINE_BUTTON2",
  "DEFINE_BUTTON_CXFORM",
  "DEFINE_BUTTON_SOUND",
  "DEFINE_EDIT_TEXT",
  "DEFINE_FONT",
  "DEFINE_FONT2",
  "DEFINE_FONT3",
  "DEFINE_FONT4",
  "DEFINE_FONT_ALIGN_ZONES",
  "DEFINE_FONT_INFO",
  "DEFINE_FONT_INFO2",
  "DEFINE_FONT_NAME",
  "DEFINE_MORPH_SHAPE",
  "DEFINE_MORPH_SHAPE2",
  "DEFINE_SCALING_GRID",
  "DEFINE_SCENE_AND_FRAME_LABEL_DATA",
  "DEFINE_SHAPE",
  "DEFINE_SHAPE2",
  "DEFINE_SHAPE3",
  "DEFINE_SHAPE4",
  "DEFINE_SOUND",
  "DEFINE_SPRITE",
  "DEFINE_TEXT",
  "DEFINE_TEXT2",
  "DEFINE_VIDEO_STREAM",
  "DO_ABC",
  "DO_ABC_",
  "DO_ACTION",
  "DO_INIT_ACTION",
  "ENABLE_DEBUGGER",
  "ENABLE_DEBUGGER2",
  "END",
  "EXPORT_ASSETS",
  "FILE_ATTRIBUTES",
  "FRAME_LABEL",
  "IMPORT_ASSETS",
  "IMPORT_ASSETS2",
  "JPEG_TABLES",
  "METADATA",
  "PLACE_OBJECT",
  "PLACE_OBJECT2",
  "PLACE_OBJECT3",
  "PROTECT",
  "REMOVE_OBJECT",
  "REMOVE_OBJECT2",
  "SCRIPT_LIMITS",
  "SET_BACKGROUND_COLOR",
  "SET_TAB_INDEX",
  "SHOW_FRAME",
  "SOUND_STREAM_BLOCK",
  "SOUND_STREAM_HEAD",
  "SOUND_STREAM_HEAD2",
  "START_SOUND",
  "START_SOUND2",
  "SYMBOL_CLASS",
  "VIDEO_FRAME",
  "PRODUCT_INFO",
  "PATHS_ARE_POSTSCRIPT",
  "DEBUG_ID",
  "TAG255",
  "TAG253",
  "TAG750",
  "TAG751",
  "TAG700",
  "TAG1002",
  "GEN_TAG_OBJECTS",
  "CHARACTER_SET",
  "GEN_COMMAND",
  "TAG603",
  "TAG188",
  "TAG777",
  "FREE_CHARACTER",
  "NAME_CHARACTER"
];

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'Shumway'
});

connection.connect();
createTable();

var file = fs.readFileSync("result").toString();
var records = [];
file.split("\n").forEach(function (line) {
  if (line) {
    insertRecord(JSON.parse(line));
  }
});

function createTable() {
  var query = "CREATE TABLE IF NOT EXISTS SWFS (ID varchar(64), time DOUBLE, " + tags.map(function (tag) {
    return tag + " int";
  }).join(", ") + ", PRIMARY KEY (ID))";
  connection.query(query);
}

function insertRecord(record) {
  var columns = [];
  var values = [];
  for (var k in record.tags.counts) {
    if (k == "undefined") {
      continue;
    }
    columns.push(k);
    values.push(record.tags.counts[k]);
  }
  var query = "REPLACE INTO SWFS " + "(ID, TIME, " + columns.join(", ") + ") VALUES (\"" + record.name + "\", " + record.time + ", " + values.join(", ") + ")";
  console.info(query);
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    // console.log('The solution is: ', rows[0].solution);
  });
}

connection.end();
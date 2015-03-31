Very simplified botio command runner

## Preparation

Run `mkdir node_modules && npm install` in the './utils/botio' folder.

## Running the commands

To run botio command (that starts with `on_cmd_`):

```
  cd ./utils/botio
  node botio on_cmd_preview.js
```

## Adding/updating commands

New commands can be created and updated in this repository. However they will
not be deployed automatically -- the botio server administrator shall deploy the
command files (and, probably, change the shumwayConfig.js file) to a production
environment.

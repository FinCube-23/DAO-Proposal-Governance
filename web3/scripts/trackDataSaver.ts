module.exports = {
    trackDataSaver: async function (file_name: string, key_name: string, value: any) {
      const fs = require("fs");
      // json data
      var jsonData = `{ "${key_name}" : "${value}" }`;
      fs.writeFileSync(
        `../json-log/${file_name}.json`,
        jsonData,
        "utf8",
        function (err: any) {
          if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
          }
          console.log("JSON file has been saved.");
        }
      );
    },
  };
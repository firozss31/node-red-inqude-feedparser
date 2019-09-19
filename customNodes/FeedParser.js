try {
  var cheerio = require('cheerio');
} catch (e) {
  console.log('error in require ');
  console.log(e);
}
module.exports = function(RED) {

  function feedParser(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.on('input', function(msg) {

      const parse = (p, o) =>
        p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

      var inputData = config.data;

      inputData = inputData.split('][');
      inputData[0] = inputData[0].split('[')[1];
      inputData[inputData.length - 1] = inputData[inputData.length - 1].split(']')[0];

      var temp = {
        title: config.title,
        link: config.link,
        image: config.image,
        image2: config.image2 || '',
        image3: config.image3 || '',
        category: config.category,
        custom1: config.custom1 || '',
        custom2: config.custom2 || '',
        custom3: config.custom3 || '',
      }

      for (var item in temp) {
        if (temp[item] && temp[item].length) {
          var first = temp[item].split('][');
          first[0] = first[0].split('[')[1];
          first[first.length - 1] = first[first.length - 1].split(']')[0];
          temp[item] = first;
        }
      }

      for (var i in temp) {
        var tempArr = [];
        for (var item in temp[i]) {
          if (inputData[item] != temp[i][item]) {
            tempArr.push(temp[i][item]);
          }
        }
        temp[i] = tempArr.slice(1);
      }

      var allItems = parse(inputData, msg);

      var resultData = [];
      for (var item in allItems) {
        var value = {};
        for (var a in temp) {
          if (temp[a] && temp[a].length) {
            value[a] = parse([item].concat(temp[a]), allItems);
          } else {
            value[a] = ''
          }

          if (config.changeType && config.changeType == a && config.searchFor && config.replaceWith) {
            if (value[a].includes(config.searchFor)) {
              value[a] = value[a].replace(config.searchFor, config.replaceWith);
            }
          }
          if (a == 'image' && config.extractImage == 'yes') {
            const $ = cheerio.load(JSON.stringify(value[a]));
            var imageSrc = ($('img').attr('src')).replace(/\\/g, '');
            try {
              imageSrc = JSON.parse(imageSrc);
            } catch (e) {} finally {
              value[a] = imageSrc;
            }
          }
        }
        resultData.push(value);
      }

      msg.payload['treepath'] = temp;
      msg.payload['resultData'] = resultData;
      var outMsg = {
        payload: msg.payload
      };

      node.send(outMsg);

    });

  }
  RED.nodes.registerType("Feed Parser", feedParser);
};
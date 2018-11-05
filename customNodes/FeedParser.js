module.exports = function(RED) {

    function feedParser(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        this.on('input', function(msg) {

          const parse = (p, o) =>
          p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)

          var inputData =  config.data;

              inputData = inputData.split('][');
              inputData[0] = inputData[0].split('[')[1];
              inputData[inputData.length-1] = inputData[inputData.length-1].split(']')[0];

          var temp = {
            title:  config.title,
            link:  config.link,
            image:  config.image,
            category: config.category
          }

        for(var item in temp) {
          var first = temp[item].split('][');
              first[0] = first[0].split('[')[1];
              first[first.length-1] = first[first.length-1].split(']')[0];
              temp[item] = first;
        }

        for(var i in temp) {
          var tempArr = [];
          for(var item in temp[i]){
            if(inputData[item] != temp[i][item]){
              tempArr.push(temp[i][item]);
            }
          }
          temp[i] = tempArr.slice(1);
        }

        var allItems = parse(inputData, msg);

        var resultData =[];
        for(var item in allItems) {
          var value = {};
          for(var a in temp){
            value[a]  = parse([item].concat(temp[a]), allItems);
          }
          resultData.push(value);
        }

        msg.payload['treepath'] = temp;
        msg.payload['resultData'] = resultData;
        var outMsg = {payload: msg.payload};

        node.send(outMsg);

        });

    }
    RED.nodes.registerType("Feed Parser",feedParser);
};

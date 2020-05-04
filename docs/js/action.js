(function(){
  'use strict';
  angular.module('CJTTApp', [])
  .controller('CJTTController', CJTTController)
  .service('CJTTService', CJTTService)
  .constant('GASEndpoint', 'https://script.google.com/a/24-7intouch.com/macros/s/AKfycby2EgOWBETZ5jsQac2nccFKJ9qhyVktQ11bmt0G/exec');

  CJTTController.$inject = ['CJTTService'];
  function CJTTController(CJTTService) {
    var JTCtrl = this;
    JTCtrl.error = false;
    JTCtrl.forma = false;
    JTCtrl.newjirabox = false;
    JTCtrl.descriptionbox = false;
    JTCtrl.loading = true;
    JTCtrl.business = "b2c";
    JTCtrl.jira = "";
    JTCtrl.newjira = "";
    JTCtrl.description = "";
    JTCtrl.reference = "";
    JTCtrl.ticket = "";
    JTCtrl.jiralist = [];
    JTCtrl.change = function () {
      JTCtrl.error = false;
      if (JTCtrl.jira === "new") {
        JTCtrl.newjirabox = true;
        JTCtrl.descriptionbox = false;
        JTCtrl.description = "";
      } else {
        JTCtrl.loading = true;
        var promesa1 = CJTTService.getJIRAInfo(JTCtrl.jira);
        JTCtrl.descriptionbox = false;
        promesa1.then(function (respuesta) {
          JTCtrl.newjirabox = false;
          JTCtrl.loading = false;
          if (respuesta.length == 0) {
            JTCtrl.description = "";
            JTCtrl.reference = "";
          } else {
            JTCtrl.description = respuesta.desc;
            JTCtrl.reference = respuesta.ref;
            JTCtrl.descriptionbox = true;
          };
        });
      };
    };
    JTCtrl.getJIRAS = function () {
      JTCtrl.error = false;
      JTCtrl.loading = true;
      var promesa2 = CJTTService.getTrackerJIRAs();
      promesa2.then(function (respuesta) {
        JTCtrl.loading = false;
        if (respuesta.length == 0) {
          JTCtrl.jiralist = [];
        } else {
          JTCtrl.jiralist = respuesta;
          JTCtrl.forma = true;
        };
      });
    };
    JTCtrl.retrieveJIRA = function () {
      JTCtrl.error = false;
      JTCtrl.loading = true;
      JTCtrl.descriptionbox = false;
      var promesa3 = CJTTService.getJIRAInfo(JTCtrl.newjira);
      promesa3.then(function (respuesta) {
        JTCtrl.loading = false;
        if (respuesta.length == 0) {
          JTCtrl.description = "That JIRA doesn't exist in current Known Issues records.";
          JTCtrl.reference = "0";
          JTCtrl.descriptionbox = true;
        } else {
          JTCtrl.description = respuesta.desc;
          JTCtrl.reference = respuesta.ref;
          JTCtrl.descriptionbox = true;
        };
      });
    };
    JTCtrl.trackTicket = function () {
      JTCtrl.error = false;
      if (((JTCtrl.jira != "") || (JTCtrl.jira != "new") || (JTCtrl.newjira != "")) && (JTCtrl.description != "") && (JTCtrl.ticket != "") && (JTCtrl.reference != "") && (JTCtrl.reference != "0")) {
        JTCtrl.loading = true;
        if (JTCtrl.jira == "new") {
          var jirasent = JTCtrl.newjira;
        } else {
          var jirasent = JTCtrl.jira;
        }
        var promesa4 = CJTTService.sendTicket(jirasent, JTCtrl.business, JTCtrl.ticket);
        promesa4.then(function (respuesta) {
          JTCtrl.loading = false;
          if (respuesta) {
            JTCtrl.forma = false;
            JTCtrl.logrado = true;
          } else {
            JTCtrl.fallado = true;
          };
        });
      } else {
        JTCtrl.error = true;
      };
    };
  };

  CJTTService.$inject = ['$http', 'GASEndpoint'];
  function CJTTService($http, GASEndpoint) {
    var JTSrvs = this;
    JTSrvs.getTrackerJIRAs = function () {
      return $http.get(GASEndpoint + '?option=getList',{
        jsonpCallbackParam: 'option'
      })
      .then(function (result) {
        return result.data;
      }).catch(function (result) {
        console.log(result);
      });
    };
    JTSrvs.getJIRAInfo = function (jira) {
      return $http.get(GASEndpoint + '?option=getDesc&jira=' + jira, {
        jsonpCallbackParam: 'option'
      })
      .then(function (result) {
        return result.data;
      }).catch(function (result) {
        console.log(result);
      });
    };
    JTSrvs.sendTicket = function (jira, business, ticket) {
      var ctrl = '' + Date.now();
      var p1 = '&jira=' + jira;
      var p2 = '&business=' + business;
      var p3 = '&ticket=' + ticket;
      var p4 = '&stamp=' + ctrl;
      var url = GASEndpoint + '?option=trackTicket' + p1 + p2 + p3 + p4;
      return $http.get(url, {
        jsonpCallbackParam: 'option'
      })
      .then(function (result) {
        if (result.data.stamp == ctrl) {
          return result.data.success;
        } else {
          return false;
        };
      }).catch(function (result) {
        return false;
      });
    };
  };
})();
///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dgrid/OnDemandList',
  'dgrid/Selection',
  'dojo/store/Memory',
  'esri/tasks/query',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
], function(
  declare,
  BaseWidget,
  lang,
  Deferred,
  OnDemandList,
  Selection,
  Memory,
  Query,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  SimpleFillSymbol
) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    WidgetsInTemplat: true,
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-ListviewDemo',

    postCreate: function() {
      this.inherited(arguments);
      // this.config = {
      //   layerId: 'JoshuaTreeImages_413',
      //   thumbnailField: 'pic_url',
      //   titleField: 'name',
      //   widgetHeaderText: 'Please select a feature:',
      // };
      // this.headerNode.innerHTML = this.config.widgetHeaderText;
      this.featureLayer = this.map.getLayer(this.config.layerId);
      var highlightSymbol;
      switch (this.featureLayer.geometryType) {
        case 'esriGeometryPoint':
          highlightSymbol = new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            20,
            null,
            '#e74c3c'
          );
          break;
        case 'esriGeometryPolyline':
          highlightSymbol = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            '#e74c3c',
            3
          );
          break;
        case 'esriGeometryPolygon':
          highlightSymbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, '#fff', 2),
            '#e74c3c'
          );
          break;
      }
      this.featureLayer.setSelectionSymbol(highlightSymbol);
      this.createList();
    },

    startup: function() {
      this.inherited(arguments);

      // let t = this.getDataStore();
      // console.log(t);
      // this.mapIdNode.innerHTML = 'map id:' + this.map.id;
    },

    onOpen: function() {
      console.log('onOpen');
    },

    onClose: function() {
      console.log('onClose');
    },

    getDataStore: function() {
      var def = new Deferred();
      var layer = this.map.getLayer(this.config.layerId);
      var query = new Query();
      query.returnGeometry = false;
      query.outFields = ['*'];
      query.where = '1=1';

      layer.queryFeatures(
        query,
        lang.hitch(this, function(featureSet) {
          var featureSetRemapped = [];
          for (var index in featureSet.features) {
            var feature = featureSet.features[index];
            featureSetRemapped.push({
              id: feature.attributes[this.featureLayer.objectIdField],
              title: feature.attributes[this.config.titleField],
              thumbnailImg: feature.attributes[this.config.thumbnailField],
            });
          }

          def.resolve(
            new Memory({
              data: featureSetRemapped,
            })
          );
        })
      );
      return def;
    },
    createList: function() {
      this.getDataStore().then(
        lang.hitch(this, function(datastore) {
          var list = new (declare([OnDemandList, Selection]))(
            {
              store: datastore,
              selectionMode: 'single',
              renderRow: lang.hitch(this, function(object, options) {
                return this._createListItem(object);
              }),
            },
            this.ListNode
          );

          list.startup();
          list.on(
            '.dgrid-row:click',
            lang.hitch(this, function(event) {
              var row = list.row(event);
              var query = new Query();
              query.objectIds = [row.data.id];

              this.featureLayer.selectFeatures(
                query,
                esri.layers.FeatureLayer.SELECTION_NEW,
                lang.hitch(this, function(result) {
                  if (result.length) {
                    var feature = result[0],
                      newMapCenter,
                      geometry = feature.geometry,
                      extent = geometry.getExtent(),
                      shape = feature.getShape();

                    if (extent && extent.getCenter) {
                      newMapCenter = extent.getCenter(); // polygon & polyline
                    } else {
                      newMapCenter = geometry; // point
                    }
                    console.log(this.map);
                    this.map.centerAt(newMapCenter); // move to the feature
                    if (shape) shape.moveToFront(); // move the feature to front
                  }
                })
              );
            })
          );
        })
      );
    },
    _createListItem: function(featureObj) {
      var listItemRoot = document.createElement('DIV');
      listItemRoot.className = 'list-item';
      if (featureObj) {
        var thumbnailImgWrapper, thumbnailImg, listItemTitle;
        // Create thumbnail
        if (featureObj.thumbnailImg) {
          thumbnailImgWrapper = document.createElement('div');
          thumbnailImgWrapper.className = 'thumbnail-wrapper';
          thumbnailImg = document.createElement('img');
          thumbnailImg.src = featureObj.thumbnailImg;
          thumbnailImgWrapper.appendChild(thumbnailImg);
          listItemRoot.appendChild(thumbnailImgWrapper);
        }
        // Create title
        if (featureObj.title && typeof featureObj.title === 'string') {
          listItemTitle = document.createElement('H4');
          listItemTitle.innerHTML = featureObj.title;
          listItemRoot.appendChild(listItemTitle);
          if (thumbnailImg) thumbnailImg.alt = featureObj.title;
        }
      } else {
        listItemRoot.innerHTML = 'NO DATA AVAILABLE';
      }
      // console.log(listItemRoot);
      return listItemRoot;
    },

    onSignOut: function() {
      console.log('onSignOut');
    },
  });
});

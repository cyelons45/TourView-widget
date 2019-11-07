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
  'jimu/BaseWidgetSetting',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/LayerInfos/LayerInfos',
  'dijit/form/Select',
], function(
  declare,
  BaseWidgetSetting,
  lang,
  array,
  _WidgetsInTemplateMixin,
  LayerInfos
) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-ListviewDemo-setting',

    postCreate: function() {
      this.inherited(arguments);
      this.setConfig(this.config);
      // this.getConfig();
    },

    startup: function() {
      this.inherited(arguments);
      // this.mapIdNode.innerHTML = 'map id:' + this.map.id;
      // console.log(config);
    },

    setConfig: function(config) {
      // Update header text
      this.headerTextNode.value = config.widgetHeaderText;

      // Get all feature layers from the map
      LayerInfos.getInstance(this.map, this.map.itemInfo).then(
        lang.hitch(this, function(layerInfosObj) {
          var infos = layerInfosObj.getLayerInfoArray();
          var options = [];

          array.forEach(infos, function(info) {
            if (info.originOperLayer.layerType === 'ArcGISFeatureLayer') {
              options.push({
                label: info.title,
                value: info.id,
              });
            }
          });
          this.layerSelect.set('options', options);
          this.layerSelect.on(
            'change',
            lang.hitch(this, function(value) {
              var selectedLayer = layerInfosObj.getLayerInfoById(value);
              if (selectedLayer) {
                var fieldOptions = selectedLayer.layerObject.fields.map(
                  function(field) {
                    return {
                      label: field.alias || field.name,
                      value: field.name,
                    };
                  }
                );
                this.thumbnailSelect.set('options', fieldOptions);
                this.titleSelect.set('options', fieldOptions);
              }
            })
          );
        })
      );
    },

    getConfig: function() {
      //WAB will get config object through this method
      return {
        widgetHeaderText: this.headerTextNode.value,
        layerId: this.layerSelect.get('value'),
        thumbnailField: this.thumbnailSelect.get('value'),
        titleField: this.titleSelect.get('value'),
      };
    },
  });
});

var _LoaderCounter = 0;

function LoadingSpinnerController(outputDiv) {
	
	var self = this;
	var uid = _LoaderCounter++;
	self.parentNode = document.getElementById(outputDiv);
	
	var loaderID = uid + "loading";
	var loaderDiv = document.createElement("div");
	loaderDiv.id = loaderID;
	loaderDiv.className = "loading";
	self.parentNode.appendChild(loaderDiv);
	self.loader = document.getElementById(loaderID);
	
	var messageID = uid + "msg";
	var messageDiv = document.createElement("div");
	messageDiv.id = messageID;
	messageDiv.className = "msg";
	self.loader.appendChild(messageDiv);
	self.messageNode = document.getElementById(messageID);
	
	this.show = function(msg) {
	    self.messageNode.innerHTML = msg;
	    self.loader.style.display = "block";
	};
	this.hide = function () {
		self.loader.style.display = "none";
	};
}

function DropDownController(parentNode, items, onSelect, intialLangCode, intialLangDir) {

	var self = this;
	
	this.translate = function(langCode, langDir) {
		
		self._CurrentLangCode = langCode;
		self._CurrentLangDir = langDir;

		self._OnTranslateFuncs.forEach(function(func) {
			func(langCode, langDir);
		});
		self._OnLabelTranslateFunc(langCode, langDir);
		
		self._dropDownNode.find(".translatable").css({direction:langDir});
		
		if(langDir === 'rtl') {
			self._dropDownNode.find(".dropDownButton").css({float:'left'});	
			self._dropDownNode.find(".dropDownButtonArrow").css({left:12, right:'auto'});
		}
		else if(langDir === 'ltr') {
			self._dropDownNode.find(".dropDownButton").css({float:'right'});
			self._dropDownNode.find(".dropDownButtonArrow").css({right:12, left:'auto'});
		}
	};
	
	this.css = function(cssObj) {
		self._dropDownNode.css(cssObj);
	};
	
	this.setSingleItemEnabled = function() {
		self._SingleItemEnabled = true;
	};
	
	this.disable = function() {
		self._setDropDownDisplay(0.5, 0, 'none');
	};
	
	this.isDisabled = function() {
		return self._IsDisabled;
	};
			
	this.updateValues = function(items, dontOverwriteExistingValues, selectLastItem) {
		
		self._OnTranslateFuncs = [];
		if(!dontOverwriteExistingValues) {
			self._Items = items;
		}
		self._updateDropDownItems(items, selectLastItem);	
	};
	
	this.selectValue = function(valueLabel) {
		self._selectValue('label', valueLabel, self._CurrentLangCode);
	};
	
	this.selectValueById = function(valueId) {
		self._selectValue('id', valueId);
	};
	
	this.selectFirstValue = function() {
		self._OnSelect(self._Items[0]);
	};
	
	this.setLabel = function(label) {
		self._dropDownLabelNode.val(label);
	};
	
	this.setDefaultBlank = function() {
		self._dropDownLabelNode.val('');
		self._Value = null;
	};
	
	this.values = function() {
		return self._Items.slice(0);
	};
	
	self._setLabel = function(obj) {
		
		self._OnLabelTranslateFunc = function(langCode) {
			
			if(self._CurrentLangCode) {
				self._dropDownLabelNode.val(obj['label'][langCode]);
			}
			else {
				self._dropDownLabelNode.val(obj['label']);
			}
		};
		
		self._OnLabelTranslateFunc(self._CurrentLangCode, self._CurrentLangDir);
	};
	
	this.value = function(obj) {
		
		if(obj) {			
			self._setLabel(obj);
			self._Value = obj;
		}
		else {
			return self._Value;
		}
	};
	
	this.hide = function() {
		self._dropDownNode.hide();
	};
	
	this.show = function() {
		self._dropDownNode.show();
	};
	
	self._setDropDownDisplay = function(opacity, arrowOpacity, pointerEvent) {
		
		self._dropDownNode.css({pointerEvents:pointerEvent,opacity:opacity});
		self._dropDownButtonArrowNode.css({opacity:arrowOpacity});
		self._IsDisabled = arrowOpacity;
	};
	
	self._selectValue = function(key, value, otherKey) {
		
		for(var i=0;i<self._Items.length;i++) {
			
			var val = otherKey ? self._Items[i][key][otherKey] : self._Items[i][key];
			
			if(val === value) {
				
				var item = self._Items[i];
				self._setLabel(item);
				self._Value = item;
				self._OnSelect(item);
				break;
			}
		};
	};
	
	self._openDropDownMenu = function() {
		
	    self._dropDownListNode.show();
		self._dropDownButtonArrowNode.addClass("rotate180Deg");
	    var curHeight = self._dropDownListNode.height();
	    var autoHeight = self._dropDownListNode.css('height', 'auto').height();
		self._dropDownListNode.height(curHeight).animate({height: autoHeight}, {duration:self._DROPDOWN_ANIM_DURATION_MS, complete:function() {

		}});		
	};
	
	self._closeDropDownMenu = function() {
		self._dropDownListNode.animate({height:0}, {duration:self._DROPDOWN_ANIM_DURATION_MS, complete:function() {
			self._dropDownListNode.hide();
			self._dropDownButtonArrowNode.removeClass("rotate180Deg");
		}});
	};
	
	self._toggleDropDownMenu = function() {
		self._dropDownListNode.height() === 0 ? self._openDropDownMenu():self._closeDropDownMenu();
	};
	
	self._updateDropDownItems = function(items, selectLastItem) {
		
		var items = items ? items : self._Items;
		self._dropDownListNode.empty();
		var currentSelectedItemInList = false;
		
		items.forEach(function(itemObj) {
						
			if(self._Value && self._Value['id'] !== undefined && !currentSelectedItemInList) {
				currentSelectedItemInList = self._Value['id'] === itemObj['id'];
			}
			
			var itemNode = $('<div>').addClass("dropDownItem overflowEllipsis translatable").click(function() {
				
				self._setLabel(itemObj);
				self._Value = itemObj;
				self._OnSelect(itemObj);
				self._closeDropDownMenu();
			});
			
			if(self._CurrentLangCode) {
				itemNode.html(itemObj['label'][self._CurrentLangCode]);
			}
			else {
				itemNode.html(itemObj['label']);
			}
			self._OnTranslateFuncs.push(function(langCode) {
				itemNode.html(itemObj['label'][langCode]);
			});
			self._dropDownListNode.append(itemNode);
		});
		
		if(!selectLastItem && (!currentSelectedItemInList && items.length > 0)) {
			var firstItem = items[0];
			self._setLabel(firstItem);
			self._Value = firstItem;
		}
		else if(selectLastItem && (!currentSelectedItemInList && items.length > 0)) {
			var lastItem = items[items.length-1];
			self._setLabel(lastItem);
			self._Value = lastItem;
		}
			
		if(items.length === 0) {
			self.disable();
		}
		else if(items.length === 1 && !self._SingleItemEnabled) {
			self._setDropDownDisplay(1, 0, 'none');
		}
		else {
			self._setDropDownDisplay(1, 1, 'all');
		}
		self.translate(self._CurrentLangCode, self._CurrentLangDir);
	};
	
	(function init() {
		
		self._DROPDOWN_ANIM_DURATION_MS = 200;
		self._Value = null;
		self._Items = items;
		self._OnSelect = onSelect;
		self._OnTranslateFuncs = [];
		self._OnLabelTranslateFunc = function(){};
		self._CurrentLangCode = intialLangCode;
		self._CurrentLangDir = intialLangDir;
		
		self._dropDownLabelNode = $('<input>').addClass("dropDownLabel dropDownItem overflowEllipsis translatable").attr("readonly", "");
		self._dropDownButtonNode = $('<div>').addClass("dropDownButton");
		self._dropDownButtonArrowNode = $('<div>').addClass("dropDownButtonArrow verticalCenter");
		self._dropDownButtonNode.append(self._dropDownButtonArrowNode);		
		var dropDownLabelItemsNode = $('<div>').addClass("dropDownLabelItems").append(self._dropDownButtonNode).append(self._dropDownLabelNode);
		self._dropDownListNode = $('<div>').addClass("dropDownList");
		self._dropDownNode = $('<div>').addClass("dropDownContainer").append(dropDownLabelItemsNode).append(self._dropDownListNode).appendTo(parentNode);		
		
		self._updateDropDownItems();
		
		self._dropDownButtonNode.click(self._toggleDropDownMenu);
		self._dropDownLabelNode.click(self._toggleDropDownMenu);		
	})();
}

function WSFooter(parentNode, lang1Code, lang2Code, translateModel, model, onLangClick, blogURL) {
	
	var self = this;
	
	this.translate = function(langCode, langDir) {
		
		self._CurrentLangCode = langCode;
		self._OnTranslateFunctions.forEach(function(func) {
			func(langCode, langDir);
		});
	};
	
	self._openURL = function(url) {
		window.open(url, "_blank");
	};

	this.clickLangButton = function(langCode) {
		self._LangCodeToButton[langCode].click();
	};
	
	this.hideBlogButton = function() {
		self._BlogButtonNode.hide();
	};
			
	(function init() {
		
		self._TranslateModel = translateModel;
		self._Model = model;
		self._OnTranslateFunctions = [];
		self._LangCodeToButton = {};
		self._CurrentLangCode = null;
		
		var socialMediaContainer = $("<div>").addClass("socialMediaLinksContainer").appendTo(parentNode);
		var footerControls = $("<div>").addClass("toggleLanguageContainer").appendTo(parentNode);
		
		// SOCIAL MEDIA LINKS ================================================================================
		var facebookLink = $("<div>").addClass("facebookLink icon-Facebook socialMediaLink").appendTo(socialMediaContainer);
		var twitterLink = $("<div>").addClass("twitterLink icon-twitter socialMediaLink").appendTo(socialMediaContainer);
		var emailLink = $("<div>").addClass("emailLink icon-email socialMediaLink").appendTo(socialMediaContainer);
		var linkedIn = $("<div>").addClass("linkedInLink icon-linkedin socialMediaLink").appendTo(socialMediaContainer);
		self._BlogButtonNode = $("<div>").addClass("blogLink icon-blog socialMediaLink").appendTo(socialMediaContainer);
		
		// SPATIAL SELECTOR ================================================================================
		
		if(self._Model['related_spatials_items'] && self._Model['related_spatials_items'].length) {
			
			var spatialSelectorModel = {
				'go_to_spatial_dropdown_label':self._TranslateModel['go_to_spatial_dropdown_label'],
				'go_to_spatial_title':self._TranslateModel['go_to_spatial_title'],
				'spatials':self._Model['related_spatials_items']
			};

			var spatialSelectorController = new SpatialSelectorController($('body'), spatialSelectorModel, self._CurrentLangCode);
			var goToSpatialButton = $("<div>").addClass("goToSpatialButton translatable").appendTo(footerControls).click(function() {
				spatialSelectorController.onSpatialsButtonClick();
			});			
			
			self._OnTranslateFunctions.push(function(langCode, langDir) {
				goToSpatialButton.html(self._TranslateModel['go_to_spatial_button'][langCode]);
				spatialSelectorController.translate(langCode, langDir);
			});
		}
		
		// LANGUAGE TOGGLE ================================================================================
		
		var onLangButtonClick = function(node, langCode) {
			$(".langButtonSelected").removeClass("langButtonSelected");
			node.addClass("langButtonSelected");
			onLangClick(langCode);
		};
		
		self._LangCodeToButton[lang1Code] = $("<div>").addClass(lang1Code + " langButton").appendTo(footerControls).html(self._Model[lang1Code + '_label']).click(function() {
			onLangButtonClick($(this), lang1Code);			
		});
		self._LangCodeToButton[lang1Code].addClass("langButtonSelected");
		
		$("<div>").addClass("langButtonBorder").appendTo(footerControls).html("/");
		
		self._LangCodeToButton[lang2Code] = $("<div>").addClass(lang2Code + " langButton").appendTo(footerControls).html(self._Model[lang2Code + '_label']).click(function() {
			onLangButtonClick($(this), lang2Code);
		});	

		if(!self._Model['has_second_language']) {
			footerControls.hide();
		}
		
		if(self._Model['social_media_items'].length) {
			
			var socialMediaModel = {};
			self._Model['social_media_items'].forEach(function(o) {
				socialMediaModel[o['social_media_name']] = o['link_url'];
			});
			
			self._OnTranslateFunctions.push(function(langCode, langDir) {
				
				facebookLink.unbind("click");
				facebookLink.click(function() {self._openURL(socialMediaModel['facebook'][langCode]);});
				
				twitterLink.unbind("click");
				twitterLink.click(function() {self._openURL(socialMediaModel['twitter'][langCode]);});
				
				linkedIn.unbind("click");
				linkedIn.click(function() {self._openURL(socialMediaModel['linkedin'][langCode]);});
				
				emailLink.click(function() {
					document.location = 'mailto:'+socialMediaModel['email'][langCode]+'?subject=Spatial web application';
				});
				
				self._BlogButtonNode.unbind("click");
				self._BlogButtonNode.click(function() {
					
					if(blogURL) {
						self._openURL(blogURL);
					}
				});			
			});	
		}
	})();	
}

function WSHeader(parentNode, spatialID, model, blogURL, spatialURLName) {
	
	var self = this;
	self._CurrentLangCode;

	this.translate = function(langCode, langDir) {
		
		self._CurrentLangCode = langCode;
		self._OnTranslateFunctions.forEach(function(func) {
			func(langCode, langDir);
		});
	};
	
	this.highlightMapButton = function() {
		self._MapButton.addClass("headerTextButtonSelected");
	};
	
	this.clickMapButton = function() {
		self._MapButton.click();
	};
	
	this.hideMapButton = function() {
		self._MapButton.hide();
	};
	
	this.hideBlogButton = function() {
		self._BlogNuttonNode.hide();
	};

	self._openLink = function(url, openOption) {
		window.open(url, openOption);
	};
	
	self._updateNodesForLang = function(node, key, langCode, openOption, url) {
		
		node.html(self._Model[key][langCode]);
		node.unbind("click");
		node.click(function() {
			self._openLink(url, openOption);
		});
	};
		
	(function init() {
		
		self._Model = model;
		self._BlogURL = blogURL;
		self._SpatialID = spatialID;
		self._OnTranslateFunctions = [];
		
		self._LogoButton = $("<a>").addClass("logoText headerButtonColorStyle").appendTo(parentNode);
		self._HeaderTextButtons = $("<div>").addClass("headerTextButtons headerButtonColorStyle").appendTo(parentNode); 
		self._MapButton = $("<a>").addClass("mapSectionButton headerTextButton headerButtonColorStyle").appendTo(self._HeaderTextButtons);
		self._BlogNuttonNode = $("<a>").addClass("blogSectionButton headerTextButton headerButtonColorStyle").appendTo(self._HeaderTextButtons);
		
		self._OnTranslateFunctions.push(function(langCode) {
			
			var langQueryStr = "?lang="+self._CurrentLangCode;
			var urlPart = location.href.split(spatialURLName)[0];

			var landingPageURL = spatialURLName ? urlPart + spatialURLName : APP_BASE_URL;
			if(landingPageURL[landingPageURL.length-1]==="/") {
				landingPageURL = landingPageURL.substring(0, landingPageURL.length-1);
			}
			landingPageURL = spatialURLName ? landingPageURL + langQueryStr + "&id="+self._SpatialID : landingPageURL + "/" + langQueryStr;
				
			var mapPageURL = (spatialURLName ? urlPart + spatialURLName + "/map" + langQueryStr  + "&id="+self._SpatialID : APP_BASE_URL + "/map" + langQueryStr);

			self._updateNodesForLang(self._LogoButton, 'logo_button', langCode, "_self", landingPageURL);
			self._updateNodesForLang(self._MapButton, 'map_button', langCode, "_blank", mapPageURL);
			self._updateNodesForLang(self._BlogNuttonNode, 'blog_button', langCode, "_blank", self._BlogURL + langQueryStr);
		});
	})();
}

function SpatialSelectorController(parentNode, model, currentLangCode) {
	
	var self = this;
	
	this.translate = function(langCode, langDir) {
		
		self._CurrentLangCode = langCode;
		self._OnTranslateFunctions.forEach(function(func) {
			func(langCode, langDir);
		});
		
		self._SpatialSelectorWrapper.find(".translatable").css("direction", langDir);
		
		if(langDir === 'rtl') {			
			self._SpatialSelectorCloseButton.css({left:10, right:''});
		}
		else if(langDir === 'ltr') {
			self._SpatialSelectorCloseButton.css({right:10, left:''});
		}
	};
	
	this.onSpatialsButtonClick = function() {
		self._SpatialSelectorWrapper.toggle();
	};
	
	(function init() {
		
		self._Model = model;
		self._OnTranslateFunctions = [];
		self._CurrentLangCode = currentLangCode;

		self._SpatialSelectorWrapper = $("<div>").addClass("spatialSelectorWrapper").appendTo(parentNode).click(function() {
			self._SpatialSelectorWrapper.hide();
		});
		self._SpatialSelectorWrapper.hide();
		
		var spatialSelectorMenu = $("<div>").addClass("spatialSelectorMenu").appendTo(self._SpatialSelectorWrapper);	
		spatialSelectorMenu.click(function(e) {
			e.preventDefault();
			return false;
		});
		var spatialSelectorTitle = $("<div>").addClass("spatialSelectorTitle translatable").appendTo(spatialSelectorMenu);
		var spatialSelectorDropDownContainer = $("<div>").addClass("spatialSelectorDropDownContainer").appendTo(spatialSelectorMenu);
		
		var dropDownControllerValues = self._Model['spatials'].map(function(o) {
			var url = o['spatial_url'] ? "http://" + o['spatial_url']:'?id=' + o['other_spatial_id'];
			return {label:o['spatial_label'], url:url};
		});
		
		var dropDownController = new DropDownController(spatialSelectorDropDownContainer, dropDownControllerValues, function(obj) {
			dropDownController.setLabel(self._Model['go_to_spatial_dropdown_label'][self._CurrentLangCode]);
			window.open(obj['url'], "_blank");
			self._SpatialSelectorWrapper.hide();
		}, self._CurrentLangCode);

		self._SpatialSelectorCloseButton = $("<div>").addClass("spatialSelectorCloseButton icon-icon_close").appendTo(spatialSelectorMenu).click(function() {
			self._SpatialSelectorWrapper.hide();
		});
		
		self._OnTranslateFunctions.push(function(langCode, langDir) {
			
			dropDownController.translate(langCode, langDir);
			dropDownController.setLabel(self._Model['go_to_spatial_dropdown_label'][langCode]);
			spatialSelectorTitle.html(self._Model['go_to_spatial_title'][langCode]);
		});
	})();
};

function Utils() {
	
	var self = this;
	self._LoadingController = new LoadingSpinnerController("body");

	this.getQueryStringParameters = function() {
		
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++) {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	};
	
	this.updateURL = function(section, lang, prefix, isRoot) {

		var currentURL = location.href;		
		var splitChars = currentURL.indexOf(section + ".html") > 0 ? section + ".html":"?";
		var baseURL = currentURL.split(splitChars)[0];
		var newURLState;
		if(prefix) {
			newURLState = baseURL + prefix + "/" + (isRoot ? "": section);
		}
		else {
			newURLState = baseURL + (isRoot ? "": section);
		}
		if(lang) {
			newURLState += isRoot ? lang: "/" + lang;
		}
		window.history.replaceState("", "",  newURLState);
	};
	
	this.loadCSSfile = function(cssFileName) {
		$("head").append("<link rel='stylesheet' href='"+cssFileName+"' type='text/css' />");
	};

	this.mergeTwoObjects = function(obj1, obj2, prop1, prop2, extraProp) {
		
		for(var k in obj1) {
			
			var obj1KIsUndefined = obj1[k] == undefined;
			
			if((k === prop1 && (obj2 != undefined)) && (!obj1KIsUndefined && obj1[k][extraProp] == undefined)) {
				obj1[prop2] = obj2[prop2];
			}
			else if(!obj1KIsUndefined && obj1[k][extraProp] != undefined) {
				for(var k2 in obj2) {
					if(obj1[k][extraProp] === obj2[k2][extraProp]) {
						obj1[prop2] = obj2[k2];
					}
					break;
				}
			}
			else if(typeof obj1[k] === 'object' && obj2) {
				self.mergeTwoObjects(obj1[k], obj2[k], prop1, prop2);
			}
		}
	};

	this.executeCSS3Animation = function(node, onAnimationEnd) {
		node.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(event) {
			node.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
			onAnimationEnd();
		});	
	};

	this.augementControllerWithGlobalBehaviors = function(controller) {
		
		var loadingController = new LoadingSpinnerController("body");
		controller.showLoading = loadingController.show;
		controller.hideLoading = loadingController.hide;
		controller.executeCSS3Animation = self.executeCSS3Animation;
		controller.executeGETRequest = self.executeGETRequest;
		controller.mergeTwoObjects = self.mergeTwoObjects;
	};
	
	self._onError = function(e, callback) {
		if(e.responseText && e.status === 200) {
			callback(e.responseText);
		}
		else {
			if(e.statusText === "error") {
				e.error = e.state();
			}
			callback(e);
			console.error(e);
		}
		self._LoadingController.hide();
	};
	
	self._executeAjaxRequest = function(type, url, callback, data, token) {
		
		self._LoadingController.show("Loading");
		var args = {
			type: type,
			url:url,
			contentType: "application/json",
			dataType: "json",
			success:function(result) {
				callback(result);
				self._LoadingController.hide();
			},
			error:function(e) {
				self._onError(e, callback);
			},
			cache: false
		};
		if(data) {
			args['data'] = JSON.stringify(data);
		}
		if(token) {
			args['beforeSend'] = function(xhr) {
				xhr.setRequestHeader("Authorization", 'Bearer ' + token);
			};
		}
		$.ajax(args);
	};
	
	this.executeAjaxPOST = function(url, data, callback, token) {
		self._executeAjaxRequest('POST', url, callback, data, token);
	};

	this.executeGETRequest = function(url, callback, token) {
		self._executeAjaxRequest('GET', url, callback, null, token);
	};
};


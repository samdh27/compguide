/*!
 * This file is used to encompass JS functions.
 * Copyright 2011-2018 Novalsys, Inc - v.1.0.0 (01/2018)
 * Use @FEATURE to find it. (@GENERAL for platform-wide functions)
 */

/*-----------------------------------------------------*\
	@GENERAL
\*-----------------------------------------------------*/
	/* Function called to post video views.
		* @param uid        : The video UID
		* @param uid_s      : The encrypted video UID
		* @param vTime      : The current video time
		* @param bFinished  : Possible additional options, confirming that the video has been seen.
	*/
	function postVideoViews(uid, uid_s, vTime) {
        var bFinished = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

        $.ajax({
            method: "POST",
            url: "/video_views_endpoint",
            data: { uid: uid, _s: uid_s, vtime: vTime, f: bFinished },
            success: function () {
                //console.log("OK");
            }
        });
    }

	/* Function called to check if an element is in the viewport.
		* @param elem  : The element
	*/
    function isInViewport(elem) {
        var bounding = elem.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

	/* Function called to delete a particular object.
		* @param id         : The HTML object id
		* @param dest_e     : The encrypted destination
		* @param uid        : The uid to be updated
		* @param _s         : The security token
		* @param options    : Possible additional options, URL parameter style (ex: param=123&other=456). 
							  Add it as last function parameter.
	*/
	function deleteContent(id, dest_e, uid, _s) {
		var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";

		var data = { dest_e: dest_e, uid: uid, _s: _s };
		if ( options !== "" ) {
			var arrOptions = options.split("&");
			arrOptions.forEach(function (currentValue, index, arr) {
				arr[index] = currentValue.split("=");
			});
			for (i = 0; i < arrOptions.length; i++) { 
				data[arrOptions[i][0]] = arrOptions[i][1]
			}
		}
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/delete.aspx",
			data: data,
			success: function (html) {
				cmsg('Content deleted.', 1, 0);
				$('#' + id + '').fadeOut();
				setTimeout("document.getElementById('generic').style.display='none';", 2000);
			}
		});
	}

	/* Function called to delete a particular object.
		* @param id                 : The HTML object id
		* @param dest_e             : The encrypted destination
		* @param uid                : The uid to be updated
		* @param _s                 : The security token
		* @param callbackFunction   : The callback function
		* @param callbackParameters : The callback parameters
		* @param options    		: Possible additional options, URL parameter style (ex: param=123&other=456). 
						 			  Add it as last function parameter.
	*/
	function deleteContentWithCallback(id, dest_e, uid, _s, callbackFunction, callbackParameters) {
		var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : "";
		
		var data = { dest_e: dest_e, uid: uid, _s: _s };
		if ( options !== "" ) {
			var arrOptions = options.split("&");
			arrOptions.forEach(function (currentValue, index, arr) {
				arr[index] = currentValue.split("=");
			});
			for (i = 0; i < arrOptions.length; i++) { 
				data[arrOptions[i][0]] = arrOptions[i][1]
			}
		}
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/delete.aspx",
			data: data,
			success: function (html) {
				cmsg('Content deleted.', 1, 0);
				if(id) {
					$('#' + id + '').fadeOut();
				}
				setTimeout("document.getElementById('generic').style.display='none';", 2000);

				//Call the callbackFunction with the list of parameters
				callbackFunction.apply(this, callbackParameters);
			}
		});
	}

	/* Function called to delete files.
		* @param id         : The HTML object id
		* @param dest_e     : The encrypted destination
		* @param uid        : The uid to be updated
		* @param _s         : The security token
	*/
	function deleteContentFiles(id, dest_e, uid, _s) {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/upload_all_delete.aspx",
			data: { dest_e: dest_e, uid: uid, _s: _s },
			success: function (html) {
				cmsg('Content deleted.', 1, 0);
				$('#' + id + '').fadeOut();
				setTimeout("document.getElementById('generic').style.display='none';", 2000);
			}
		});
	}

	/* Function called to duplicate a particular object.
		* @param dest_e             : The encrypted destination
		* @param uid                : The uid to be updated
		* @param _s                 : The security token
		* @param callbackFunction   : Optional - The callback function
		* @param callbackParameters : Optional - The callback parameters
		* @param options            : Optional - Possible additional options, URL parameter style (ex: param=123&other=456). 
									  Add it as last function parameter.
	*/
	function duplicateData(dest_e, uid, _s) {
		var callbackFunction    = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
		var callbackParameters  = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
		var options             = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "";

		var data = { dest_e: dest_e, uid: uid, _s: _s };
		if (options !== "") {
			var arrOptions = options.split("&");
			arrOptions.forEach(function (currentValue, index, arr) {
				arr[index] = currentValue.split("=");
			});
			for (i = 0; i < arrOptions.length; i++) {
				data[arrOptions[i][0]] = arrOptions[i][1];
			}
		}
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/duplicate",
			data: data,
			dataType: "json",
			success: function success(res) {
				cmsg('Content duplicated.', 1, 0);
				var responseObj = res;
				if (responseObj.alertHTML != undefined) { displayAlertMessage(responseObj.alertHTML, 'success') }
				if (responseObj.redirectURL != undefined) { window.location.href = responseObj.redirectURL; }

				callbackFunction.apply(this, callbackParameters);
			}
		});
	}

	/* Function called to update a particular object with inline editing.
		* @param message            : The CMSG input
		* @param obj                : The HTML object used for the input action
		* @param type               : The HTML object type (text, checkbox)
		* @param dest               : The destination (TODO: encrypt)
		* @param uid                : The uid to be updated
		* @param _s                 : The security token
		* @param callbackFunction   : Optional - The callback function
		* @param callbackParameters : Optional - The callback parameters
	*/
	function inlineMod(message, obj, type, dest, uid, _s) {
		var callbackFunction    = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : function () {};
		var callbackParameters  = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];

		if (editionEnCours) {
			return false;
		}
		else {
			editionEnCours = true;
			sauve = false;
		}

		var input = null;

		if (type == 'text' || type == 'textn') {    // Is not a checkbox: assignation de la valeur
			if (obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			obj.innerHTML = '<input style="width:95%; background-color:#fff; padding-left:3px; border:0px;font-family:arial;font-size:1em;color:#333;" id="ajax_text" value="' + obj.innerHTML + '" />';
			input = document.getElementById('ajax_text');

			input.focus();
			input.select();
		}
		else if (type == 'text_survey') {
			if (obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			input = document.getElementById('ajax_text_' + uid);

			input.focus();
			input.select();
			type = "text";
		}
		else if (type == 'textarea') {
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			obj.innerHTML = '<textarea style="width:95%; background-color:#fff; border:0px;font-family:arial;font-size:1em;color:#333;" id="ajax_textarea" style="overflow: hidden" rows="10">' + obj.innerHTML + '</textarea>';
			input = document.getElementById('ajax_textarea');

			input.focus();
		}
		else if (type == 'textarea_feed') {
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			obj.innerHTML = '<textarea id="ajax_textarea" rows="5">' + obj.innerHTML.replace(/<br\s*\/?>/mg, "\n"); + '</textarea>';
			input = document.getElementById('ajax_textarea');
			input.focus();
			type = "textarea_feed";

		}
		else if (type == 'textarea_slider_') {
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			obj.innerHTML = '<textarea style="width:95%; background-color:#fff; border:0px;font-family:arial;font-size:1em;color:#333;" id="ajax_textarea" style="overflow: hidden" rows="5">' + obj.innerHTML + '</textarea>';
			input = document.getElementById('ajax_textarea');

			input.focus();
			type = "textarea";
		}
		else if (type == 'textarea_slider') {
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			//obj.innerHTML = '<textarea style="width:95%; background-color:#fff; border:0px;font-family:arial;font-size:1em;color:#333;" id="ajax_textarea" style="overflow: hidden" rows="5">' + obj.innerHTML + '</textarea>';
			input = document.getElementById('ajax_textarea');
			input.focus();
			type = "textarea";
		}
		else if (type == 'text_slider') {  
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			input = document.getElementById('ajax_text');

			input.focus();
			input.select();
			//type = "text";
		}
		else if (type == 'textarea_survey') {
			if (Right(obj.innerHTML, 3) == '...' || obj.innerHTML == 'Empty' || obj.innerHTML == '<span class=\"empty_field\">Empty</span>') { obj.innerHTML = '' }
			input = document.getElementById('ajax_textarea_' + uid);
			input.focus();
			type = "textarea";
		}
		else //checkbox
		{
			input = document.createElement("checkbox");
			input.type = "checkbox";
			input.setAttribute("checked", "checked");

			obj.replaceChild(input, obj.firstChild);
			input.focus();
		}

		input.onblur = function sortir() {
			var strPassedDate;
			strPassedDate = input.value;
			if (strPassedDate == '') { strPassedDate = 'Empty'; }
			if (type == 'textarea_feed') {
				strPassedDate = strPassedDate.replace(/\n/g, "<br>");
				type = "textarea";
				location.reload();
			}
			if (type == 'text_slider') {
				console.log('test');
				document.getElementById("photoTextLegend").innerHTML = input.value;
				$("#mainImageInfo").toggle();             
				$("#frmEdit").toggle();
				type = "text";
			}
			updateData(message, obj, type, dest, strPassedDate, uid, _s);

			if (dest == 'file_uploads-student_comments') {
				document.getElementById("descriptionText").innerHTML = input.value;
				$("#frmEdit").hide();
				$("#mainImageInfo").toggle();
			}

			//delete input;

			//Call the callbackFunction with the list of parameters
			callbackFunction.apply(this, callbackParameters);
		}

		input.onkeydown = function keyDown(event) {
			if (!event && window.event) {
				event = window.event;
			}
			if (getKeyCode(event) == 13) // 13 for ENTER key
			{
				updateData(messages, obj, type, dest, escape(input.value), uid, _s, callbackFunction, callbackParameters);
				//delete input;

				//Call the callbackFunction with the list of parameters
				callbackFunction.apply(this, callbackParameters);
			}
		}
	}

	/* Function called to pin a particular object (mostly used in listings).
		* @param object             : The HTML button object used for the click action
		* @param strId              : The ID of the pinned element
		* @param strType            : The type of the pinned element
		* @param strTypeButton      : The class for the new pin button (after click)
		* @param strStudentID       : The student ID
		* @param strTypeButton      : The class for the new unpinned button (after click)
	*/
	function onPinned(object, strId, strType, strTypeButton, strStudentID, strUnpinnedClass) {
		strUnpinnedClass = strUnpinnedClass ? strUnpinnedClass : 'btn btn-grey';
		var isPinned = !$(object).hasClass(strUnpinnedClass);


		if(isPinned) { //We unpin
			jQuery.ajax({
				type: "POST",
				cache: false,
				url: "/update_favorites.aspx",
				data: { id: strId, student_id: strStudentID, type: strType, like: 0 },
				success: function () {
					cmsg('Element Unpinned', 2, 0);
				}
			});
			$(object).removeClass(strTypeButton).addClass(strUnpinnedClass);
			$(object).attr('aria-label', $(object).attr('data-aria-label-unpinned'));
		}
		else { //We pin
			jQuery.ajax({
				type: "POST",
				cache: false,
				url: "/update_favorites.aspx",
				data: { id: strId, student_id: strStudentID, type: strType, like: 1 },
				success: function () {
					cmsg('Element Pinned', 2, 0);
				}
			});
			$(object).removeClass(strUnpinnedClass).addClass(strTypeButton);
			$(object).attr('aria-label', $(object).attr('data-aria-label-pinned'));
		}
	}

	/* Function called to pin a particular object (mostly used in listings).
		* @param object             : The HTML button object used for the click action
		* @param strId              : The ID of the pinned element
		* @param strType            : The type of the pinned element
		* @param strTypeButton      : The class for the new pin button (after click)
		* @param strStudentID       : The student ID
		* @param strTypeButton      : The class for the new unpinned button (after click)
	*/
	function onFeedPinned(object, strId, strType, strTypeButton, strStudentID, strUnpinnedClass) {
		strUnpinnedClass = strUnpinnedClass ? strUnpinnedClass : 'btn btn-grey';
		var isPinned = !$(object).hasClass(strUnpinnedClass);

		console.log(isPinned);

		if(isPinned) { //We unpin
			jQuery.ajax({
				type: "POST",
				cache: false,
				url: "/mobile_ws/v18/mobile_pin_post.aspx",
				data: { id: strId, student_id: strStudentID, type: strType, like: 0 },
				success: function () {
					cmsg('Element Unpinned', 2, 0);
				}
			});
			$(object).removeClass(strTypeButton).addClass(strUnpinnedClass);
		}
		else { //We pin
			jQuery.ajax({
				type: "POST",
				cache: false,
				url: "/mobile_ws/v18/mobile_pin_post.aspx",
				data: { id: strId, student_id: strStudentID, type: strType, like: 1 },
				success: function () {
					cmsg('Element Pinned', 2, 0);
				}
			});
			$(object).removeClass(strUnpinnedClass).addClass(strTypeButton);
		}
	}

	/* Function called to update a particular object.
		* @param message    : The CMSG input
		* @param obj        : The HTML object used for the input action
		* @param type       : The HTML object type (text, checkbox)
		* @param dest       : The destination (TODO: encrypt)
		* @param data       : The data
		* @param uid        : The uid to be updated
		* @param _s         : The security token
		* @param _csrf      : Optional The Cross-site request forgery token
	*/
	function updateData(message, obj, type, dest, data, uid, _s) {
		const csrf = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : "";
		if (type == 'checkbox') { if (data) { data = 1 } else { data = 0 } }
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_data.aspx",
			data: { dest: type + "-" + dest, data: data, uid: uid, _s: _s, _csrf: csrf },
			success: function (html) {
				if (html.replace(' ', '') != 'Failed') {
					editionEnCours = false;
					if (type != 'checkbox' && type != 'dropdown' && type != 'checkboxes' && type != 'number') {
						if (!data) { data = '<span class=\"empty_field\">Empty</span>' }
						if (obj) { obj.replaceChild(document.createTextNode(unescape(data)), obj.firstChild) };
					}
					//refresh the page when we activate or desactivate an officer
					if (dest == "members-active_officer" || dest == "students-verified1" || dest == "rsvp-timeslot_ids") {
						//location.reload();
					}
					if (dest == "file_uploads-checked_out_by" || dest == "events-refresh_qrcode") {
						location.reload();
					}
					if (dest == "students-profile_photo_id" || dest == "students-cover_photo_id" || dest == "students-cover_photo_id" || dest == "clubs-logo_id" || dest == "clubs-cover_id" || dest == "events-flyer_id") {
						if (document.getElementById('bigPhotoId')) {
							window.parent.document.getElementById('TB_iframeContent').src = 'resize.aspx?request_type=iframe&file_id=' + document.getElementById('bigPhotoId').value;
						}
					}
				} else {
					alert('Sorry, data update failed.<br/>Please log in again.');
				}
			}
		});
		if (message != 'nomsg') {
			if (message != '') {
				if (message.length > 10) {
					cmsg(message, message.length / 15, 0)
				}
				else {
					cmsg(message, 1, 0)
				}
			}
			else {
				cmsg('Data saved', 1, 0)
			}
		}
		return true;
	}
	

	/* Function called to update a particular object, with a callback.
		* @param message            : The CMSG input
		* @param obj                : The HTML object used for the input action
		* @param type               : The HTML object type (text, checkbox)
		* @param dest               : The destination (TODO: encrypt)
		* @param data               : The data
		* @param uid                : The uid to be updated
		* @param _s                 : The security token
		* @param callbackFunction   : The callback function
		* @param callbackParameters : The callback parameters
	*/
	function updateDataWithCallback(message, obj, type, dest, data, uid, _s, callbackFunction, callbackParameters) {
		if (type == 'checkbox') { if (data) { data = 1 } else { data = 0 } }
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_data.aspx",
			data: { dest: type + "-" + dest, data: data, uid: uid, _s: _s },
			success: function (html) {
				if (html.replace(' ', '') != 'Failed') {
					editionEnCours = false;
					if (type != 'checkbox' && type != 'dropdown' && type != 'checkboxes' && type != 'number') {
						if (!data) { data = '<span class=\"empty_field\">Empty</span>' }
						if (obj) { obj.replaceChild(document.createTextNode(unescape(data)), obj.firstChild) };
					}
					//refresh the page when we activate or desactivate an officer
					if (dest == "members-active_officer" || dest == "students-verified1" || dest == "rsvp-timeslot_ids") {
						//location.reload();
					}
					if (dest == "file_uploads-checked_out_by") {
						location.reload();
					}
					if (dest == "students-profile_photo_id" || dest == "students-cover_photo_id" || dest == "students-cover_photo_id" || dest == "clubs-logo_id" || dest == "clubs-cover_id" || dest == "events-flyer_id") {
						if (document.getElementById('bigPhotoId')) {
							window.parent.document.getElementById('TB_iframeContent').src = 'resize.aspx?request_type=iframe&file_id=' + document.getElementById('bigPhotoId').value;
						}
					}
				} else {
					alert('Sorry, data update failed.<br/>Please log in again.');
				}

				//Call the callbackFunction with the list of parameters
				callbackFunction.apply(this, callbackParameters);
			}
		});
		if (message != 'nomsg') {
			if (message != '') {
				if (message.length > 10) {
					cmsg(message, message.length / 15, 0)
				}
				else {
					cmsg(message, 1, 0)
				}
			}
			else {
				cmsg('Data saved', 1, 0)
			}
		}
		return true;
	}

	/* Function returning the HTML for the loader.
		* @param message : The message to display under the loader.
	*/
	function writeLoading(message) {
		if (message == "") { message = "Loading"};
		return "<p class='loader'>" 
					+ "<img alt='Loading' src='/images/loader-big.gif'>"
					+ "<br> " + message
				+ "</p>"
	}


	/* Function used to update joins table.
		* @param dest_e 			: The encrypted destination
		* @param f_field_e 			: The encrypted first key field name (of the join table)
		* @param s_field_e 			: The encrypted second key field name (of the join table)
		* @param f_table_e			: The encrypted first key table name 
		* @param f_uid 				: The first key uid
		* @param f_uid_s            : The first key security token
		* @param s_table_e			: The encrypted second key table name
		* @param s_uid 				: The second key uid
		* @param s_uid_s            : The second key security token
		* @param data 				: The data input (0 || 1)
		* @param callbackFunction   : Optional - The callback function
		* @param callbackParameters : Optional - The callback parameters
	*/
	function saveJoin(dest_e, f_field_e, s_field_e, f_table_e, f_uid, f_uid_s, s_table_e, s_uid, s_uid_s, data) {
		var callbackFunction    = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : function () {};
		var callbackParameters  = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : [];

		var action = ""
		if (data) { action = "add" } else { action = "del" }
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/ajax_save_joins",
			data: 
				{ 	dest_e      : dest_e,
					f_field_e	: f_field_e,
					s_field_e   : s_field_e,
					f_table_e   : f_table_e,
					f_uid       : f_uid,
					f_uid_s     : f_uid_s,
					s_table_e   : s_table_e,
					s_uid     	: s_uid,
					s_uid_s     : s_uid_s,
					action      : action 
				},
			success: function () {
				cmsg("Data saved", 1, 0);
				callbackFunction.apply(this, callbackParameters);
			}
		});
	}


	/* Function used to update ordering for drag & drop.
		* @param dest_e 			: The encrypted destination
		* @param field_name_e		: The encrypted ordering field name
		* @param item_id 			: The moved item id
		* @param item_position 		: The new position of the item
		* @param security_field_e 	: Either 'school' or 'club' to identify the security param to check (encrypted)
		* @param filter_name_e 		: The encrypted first filtering field name
		* @param filter_name_opt_e 	: The encrypted second filtering field name (optional)
	*/
	function saveOrdering(dest_e, field_name_e, item_id, item_position, security_field_e, filter_name_e, filter_name_opt_e) {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/ajax_save_ordering",
			data: 
			{ 
				dest_e 				: dest_e,
				field_name_e 		: field_name_e,
				item_id 			: item_id,
				item_position 		: item_position,
				security_field_e 	: security_field_e,
				filter_name_e 		: filter_name_e,
				filter_name_opt_e 	: filter_name_opt_e 
			},
			success: function () {
				cmsg("Ordering saved", 1, 0);
			}
		});
	}


	/* Function used to update user settings (preferences & views).
		* @param settingName 		: The setting name
		* @param settingValue		: The setting value
		* @param clubID				: A club ID (optional)

	*/
	function saveSettings(settingName, settingValue) {
		var clubID = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/settings_endpoint",
			data: 
			{ 
				name  : settingName,
				value : settingValue,
				club  : clubID
			},
			success: function () {
				//Nothing
			}
		});
	}



	/* Function called to make a button loading.
		* @param button  : The button element.
	*/
	function loadButton(button) {
		var buttonHtml = button.html();
		var buttonWidth = button.css('width');
		var backgroundColor = button.css('background-color');

		button.attr("data-width", buttonWidth);
		button.attr("data-html", buttonHtml);
		button.attr("data-color", backgroundColor);

		button.html('<span class="glyphicon glyphicon-refresh mdi-custom_spin"></span>');
		button.css('width', buttonWidth);
		button.prop('disabled', true);
	}

	/* Function called to restore a button as it was.
		* @param button  : The button element.
	*/
	function restoreButton(button, timeout) {
		setTimeout(function() {
			button.html(button.attr("data-html"));
			button.css('width', button.attr("data-width"));
			button.css('background-color', button.attr("data-color"));
			button.prop('disabled', false);
		},  (timeout ? timeout : 0));
	}

	/* Function called to display the button with error and then restore it.
		* @param button  : The button element.
	*/
	function errorButton(button, time) {
		button.html('<span class="mdi mdi-alert-circle"></span>');
		button.css('width', button.attr("data-width"));
		button.css('background-color', 'red');
		setTimeout(function() {
			restoreButton(button);
		}, (time ? time : 2000));
	}

	/* Function called to display only fex lines of a text (attribute data-max-lines to set the value)
		* @param className  : The class selector of the texts to clamp
	*/
	function clampText(className) {
        $('.' + className).each(function(index, element) {
			if ($(element).is(':visible')) {
				if (!$(element).hasClass('clamped')) {
					if ($(element).hasClass('more-button')) {
						$(element).attr('full-text', $(element).html());
					}

					$clamp(element, {clamp: $(element).attr('data-max-lines'), useNativeClamp:false});
					$(element).addClass('clamped');

					if ($(element).hasClass('more-button') && $(element).html() != $(element).attr('full-text')) {
						$(element).after('<div class="more-button-container" style="text-align:center;cursor:pointer;margin-top:5px" onclick="displayClampedText(this, \'' 
						+ $(element).attr('id') + '\')"><span class="mdi mdi-chevron-down"></span></div>')
					}
				}
			} else {
				$(element).addClass('should-clamp');
			}
        });
	}
	
	/* Function called to display only fex lines of a text (attribute data-max-lines to set the value)
		* @param element  : the more element, will be hiden
		* @param id  : The id of the text element
	*/
	function displayClampedText(element, id) {
		var text = $('#' + id).attr('full-text');
		var currentHeight = $('#' + id).height();
		$('#' + id).html(text);
		$('#' + id).css("max-height", currentHeight + 'px');
		$('#' + id).animate({maxHeight: 1000},500);
		$(element).hide();
	}

	/* Function called to show hidden items
		* @param element  : the more element, will be rotated
		* @param id  : The id of the hidden element
	*/
	function showMoreItems(moreElement, id) {
		var element = $('#' + id);
		if (element.is(':visible')) {
			$(moreElement).css({'transform' : ''});
		} else {
			$(moreElement).css({'transform' : 'rotate(180deg)'});
		}
		element.slideToggle(200);
		clampText('should-clamp');
	}



	/* Flash an array of elements for a given time
		* @param elements  : The array of elements
		* @param time  : The flashing time.
	*/
	function flashElements(elements, time) {
		var i;
		var element;
		for (i = 0; i < elements.length; i++) {
			element = elements[i];
			element.css('border-color', '#66afe9');
			element.css('box-shadow', 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6)');
			element.css('border-width', '2px');
		}

		setTimeout(function() {
			var i;
			var element;
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				element.css('border-color', '');
				element.css('box-shadow', '');
				element.css('border-width', '');
			}
		}, time);
	}

	/* Set a param in the current url and return the new url string
		* @param param  : The param to set
		* @param value  : The value of the param
	*/
	function setUrlParameter(param, value) {
		var url = new URL(location.href);
		url.searchParams.set(param, value);
		return url.href;
	}


	/* Return a debounced function
		* @param func  		  : the function to debounce
		* @param wait         : the debounce time
		* @param immediate    : if true, the function will be called immediatelly.
	*/
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	/* Return a throttled function
		* @param func  		  : the function to debounce
		* @param wait         : the debounce time
		* @param options      : {leading, trailing}
	*/
	function throttle(func, wait, options) {
		var now = _.now();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
		  if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		  }
		  previous = now;
		  result = func.apply(context, args);
		  if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
		  timeout = setTimeout(later, remaining);
		}
		return result;
	  };

	/* Save a click in db
		* @param type  		  : The type
		* @param typeId       : The typeId
	*/
	function saveClick(type, typeId) {
		getContent('xxx', 'save_click_endpoint?type=' + type + '&type_id=' + typeId);
	}


/*-----------------------------------------------------*\
	@TOOLTIP
\*-----------------------------------------------------*/
	/* Display a help tooltip
		* @param selector  : used to find the element on the page
		* @param title     : The title of the tooltip
		* @param message   : The message of the tooltip
		* @param id  	   : The db id of the tooltip
		* @param settings  : A setting JS object {color, new, testDisplay, icon, width}
	*/
	function displayTooltip(selector, title, message, id, settings) {
		var pageElement = $(selector);
		if (!pageElement.is(':visible')) return;

		var offsetLeft = pageElement.offset().left;
		var arrowLeftPercent = (offsetLeft + (pageElement.outerWidth() / 2) > window.innerWidth / 2) ? 80 : 20;

		var color = (settings.color ? (settings.color) : "");
		var testDipslay = settings.testDisplay;
		var actionLink = settings.actionLink;
		var jsLink = settings.jsLink.replace(/'/g, "\\'");

		var offsetTop = pageElement.offset().top;
		var verticalClass = (offsetTop + (pageElement.outerHeight() / 2) > window.innerHeight / 2) ? 'top' : 'bottom';
		var elementHtml = $("<div id='displayed_tooltip_" + id + "' class='tooltip fade bubble " + verticalClass + " in' role='tooltip'>" +
								"<div class='tooltip-arrow' style='left: " + arrowLeftPercent + "%;border-bottom-color: " + color + ";'></div>" + 
								"<div class='tooltip-inner' style='width:" + (settings.width ? (settings.width + "px") : "") + ";background-color: " + color + ";'>" + 
									"<div><h4>" + (settings.icon ? "<span class='" + settings.icon + "'></span> " : "") + title + (settings.new ? " <div class='bubble--new badge badge-danger'>New</div>" : "") + "</h4><p>" + message + "</p></div>" + 
									"<div class='butons_container'><a href='javascript:' onclick='setNoMoreTooltips(" + id + ", 1, " + testDipslay + ")' style='color:  white;'><span class='mdi-eye-off mdi mdi mdi-font-13'></span></a>" + 
									(settings.nameLink ? "<a class='action_link btn btn-grey' " + (actionLink ? "href='" + actionLink + "'" : "") + " onclick=\";closeTooltip(" + id + ", '" + jsLink + "', " + testDipslay + ");\" style='color:" + color + ";cursor:pointer'>" + settings.nameLink + "</a>" 
									: "<a href='javascript:' style='color:white;margin-left:auto;' onclick='closeTooltip(" + id + ")'>Got it</a>") + "</div>" +
								"</div>" + 
							"</div>");
		pageElement.after(elementHtml);

		var left = (pageElement.outerWidth() / 2) - (elementHtml.outerWidth() * arrowLeftPercent / 100) + pageElement.position().left;
		var top = verticalClass == 'top' ? - elementHtml.outerHeight() + pageElement.position().top : pageElement.outerHeight() + pageElement.position().top;
		elementHtml.css('left', left + 'px');
		elementHtml.css('top', top + 'px');
		
		elementHtml.show("slide", { direction: verticalClass == 'top' ? 'down' : 'up' }, 200);

		if (!settings.testDisplay) {
			getContent('update_settings','save_parameter?name=bubble_' + id + '&value=1');
		}

		$(document)[0].addEventListener("click", checkOverlayClick, true);

		function checkOverlayClick(e) {
			if ($('#displayed_tooltip_' + id).length == 0) {
				$(document)[0].removeEventListener("click", checkOverlayClick, true);
			} else if ($(e.target).not('#displayed_tooltip_' + id) && !$.contains($('#displayed_tooltip_' + id)[0], e.target)) {
				closeTooltip(id);
				$(document)[0].removeEventListener("click", checkOverlayClick, true);
			}
		}
	}

	/* Open a alert to stop definitely the tooltips for the user
		* @param id  		  : id of the tooltip in db
		* @param value        : 1 to stop
		* @param testDisplay  : avoid the setting if true
	*/
	function setNoMoreTooltips(id, value, testDisplay) {
		if (confirm("Tooltips are here to guide you and help you discover new features.\nAre you sure that you want to stop all tooltips from being displayed? (Note: some mandatory tooltips will still be displayed time to time.)")) {
			if (!testDisplay) {
				getContent('update_settings','save_parameter?name=bubbles_stop&value=' + value);
			}
			closeTooltip(id);
		}
	}

	/* Display a help tooltip
		* @param id  : id of the tooltip in db
	*/
	function closeTooltip(id, action, testDisplay) {
		if (action) {
			if (!testDisplay) {
				saveClick('tooltip-action', id);
			}
			eval(action);
		}
		
		$('#displayed_tooltip_' + id).hide(80, function(){
			$('#displayed_tooltip_' + id).remove();
		});
	}


/*-----------------------------------------------------*\
	@MODAL
\*-----------------------------------------------------*/

	/* Function called to open a new modal.
		* @param url  : The page URL to load.
		* @param size : Optional - The modal size. Default 'lg'.
	*/
	function openModal(url) {
		let size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "lg";
		let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {backdrop: true, keyboard: true, show:true};
		
    	let pathToElementToFocusOnClose = null;
    	if (window.event && window.event.target) {
			let selector = getElementSelector(window.event.target);
			if ($(selector).length > 0) {
				pathToElementToFocusOnClose = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : selector;
			}
		}
		
		let modalId = !$("#primary-modal").is(':visible') ? "primary-modal" : "secondary-modal";

		setModalSize(modalId, size);
		$("#" + modalId).modal(options);
		$("#" + modalId).modal('show');
        initPopupAccessibility(modalId, pathToElementToFocusOnClose, 'modal');
		$("#" + modalId + " .modal-content").load(url, function (result, textSatus, jqXHR) {
			if (jqXHR.status == 403) {
				location.reload();
			}

			const openModalEvent = new CustomEvent('openModal', {detail: {'modalId': modalId} });
			document.dispatchEvent(openModalEvent);	

		});

		if (options !== undefined && options.backdrop !== undefined){
			$("#" + modalId).data('bs.modal').options.backdrop = options.backdrop;
		}
	}

    /* Function called to open a new modal with an overwritten focus on a specific element (not default one) when the modal closes
        * @param url                      	 : The page URL to load
        * @param pathToElementToFocusOnClose : The path to the element to focus on close
    */
	function openModalWithFocusOnClose(url, pathToElementToFocusOnClose) {
		openModal(url, null, null, pathToElementToFocusOnClose);
	}

	/* Function called to close a modal. Close the top modal when 2 are open. */
	function closeModal() {
		if( !$("#secondary-modal").is(':visible') ) {
			$("#primary-modal").modal('hide');
		}
		else {
			$("#secondary-modal").modal('hide');
		}
	}


	/* Function called to resize a modal.
		* @param id   : The modal identifier..
		* @param size : The modal size.
	*/
	function setModalSize(id, size) { 
		$("#" + id + " > div.modal-dialog").removeClass().addClass("modal-dialog modal-" + size);
	}

	/* Function called to load a new page URL without closing the modal.
		* @param url  : The page URL to load.
		* @param size : Optional - The modal size. Default 'lg'.
	*/
	function transitionModal(url) {
		var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "lg";
		let modalId = !$("#secondary-modal").is(':visible') ? "primary-modal" : "secondary-modal";

		setModalSize(modalId, size);
		$("#" + modalId + " .modal-content").html(writeLoading("Loading"));
		$("#" + modalId + " .modal-content").load(url, function (result) {
			const transitionModalEvent = new CustomEvent('transitionModal', {detail: {'modalId': modalId} });
			document.dispatchEvent(transitionModalEvent);	
		});

	}

	/* Function called to load a new content into the selected container without closing the modal.
		* @param url  		: The page URL to load.
		* @param selector   : The container selector.
		* @param size 		: Optional - The modal size. Default 'lg'.
	*/
	function transitionModalContent(url, selector) {
		var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "lg";
		let modalId = !$("#secondary-modal").is(':visible') ? "primary-modal" : "secondary-modal";

		setModalSize(modalId, size);
		$("#" + modalId + " .modal-content " + selector).html(writeLoading("Loading"));
		$("#" + modalId + " .modal-content " + selector).load(url, function (result) {
			const transitionModalEvent = new CustomEvent('transitionModal', {detail: {'modalId': modalId} });
			document.dispatchEvent(transitionModalEvent);	
		});
	}

	/* Function called to load a new page URL without closing the modal & without displaying a loader.
		It is advised not to change the size with this function.
		* @param url  : The page URL to load.
		* @param size : Optional - The modal size. Default 'lg'.
	*/
	function transitionModalWithoutLoading(url) {
		var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "lg";
		let modalId = !$("#secondary-modal").is(':visible') ? "primary-modal" : "secondary-modal";

		setModalSize(modalId, size);
		$("#" + modalId + " .modal-content").load(url, function (result) {/*Nothing*/});
	}


/*-----------------------------------------------------*\
	@DIALOG
\*-----------------------------------------------------*/

    /* Function that toggles a dialog open/closed when the dialog toggle is clicked OR the dialog close/search (or equivalent) buttons are pressed
        * @param dialogId                        : String ID of the dialog container element
        * @param dialogOpenFocusElementId        : String ID of the element to focus on when the dialog opens   
    */
    function openDialog(dialogId, dialogOpenFocusElementId) {
    	let pathToElementToFocusOnClose = null;
    	if (window.event && window.event.target) {
			let selector = getElementSelector(window.event.target);
			if ($(selector).length > 0) {
				pathToElementToFocusOnClose = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : selector;
			}
		}

        if (dialogId.startsWith('#')) { dialogId = dialogId.substring(1); }
        if (dialogOpenFocusElementId.startsWith('#')) { dialogOpenFocusElementId = dialogOpenFocusElementId.substring(1); }
        $('#' + dialogId).show(150);

        let focusElement = $('#' + dialogId + ' #' + dialogOpenFocusElementId)[0];
        if (!isEmpty(focusElement)) { focusElement.focus(); }

		const openDialogEvent = new CustomEvent('openDialog', {detail: {'dialogId': dialogId} });
		document.dispatchEvent(openDialogEvent);	

        initPopupAccessibility(dialogId, pathToElementToFocusOnClose);
    }

    function closeDialog(dialogId) {
    	if (dialogId.startsWith('#')) { dialogId = dialogId.substring(1); }
    	$('#' + dialogId).hide(150);
        terminatePopupAccessibility(dialogId);
    }

/*-----------------------------------------------------*\
	@COMMENTS | @LIKES | @FEED
\*-----------------------------------------------------*/
	/* Function triggered by clicking on the Comment Icon Button.
		* @param strUid                 : The UID of the item the comments are linked to.
		* @param strContainerID         : The comments container ID.
	*/
	function onComment(strUid, strContainerID){
		$("#" + strContainerID).toggle();
		$("#comment__icon-" + strUid).removeAttr("style");
		$("#comments__post-textarea-" + strUid).focus();

		let onCommentLink = $("#comment__on-comment-link-" + strUid);
		let onCommentLinkAriaLabel = $(onCommentLink).attr("aria-label");
		if ($("#" + strContainerID).css("display") === "none") {
			onCommentLinkAriaLabel = onCommentLinkAriaLabel.replace("Hide comments for", "Show comments for");
			$(onCommentLink).attr('aria-label', onCommentLinkAriaLabel);
			$(onCommentLink).attr('aria-expanded', 'false');
		} else {
			onCommentLinkAriaLabel = onCommentLinkAriaLabel.replace("Show comments for", "Hide comments for");
			$(onCommentLink).attr('aria-label', onCommentLinkAriaLabel);
			$(onCommentLink).attr('aria-expanded', 'true');
		}
	}

	/* Function triggered by clicking the "reply" link to open the comments text area
		* @param strUid                 : The UID of the item the comments are linked to.
	*/
	function onReplyToPost(strUid) {
		$('#comments__post-' + strUid).toggle();
		let replyTextarea = $('#comments__post-textarea-' + strUid)[0];
		if (!isEmpty(replyTextarea)) {
			replyTextarea.focus();
			setTimeout(function () {
				// Wait for the screen reader to catch focus change before we remove the reply link (or we will not be able to type into the textarea)				
				$('#comments__reply-' + strUid).css('display', 'none');
			}, 33); // this will not work using setTimeout value of 0 but in testing using 33 works as expected (do not change this value)
		}
	}

	/* Function triggered by clicking on the Post Comment Button.
		* @param strUid                 : The UID of the item the comments are linked to.
		* @param strType                : The type of the item the comments are linked to.
		* @param strStudentID           : The student ID.
		* @param strSubType           	: The subtype of the item the comments are linked to.
		* @param strSubTypeId           : The subtype id of the item the comments are linked to.
	*/
	function onCommentPost(strUid, strType, strStudentID, isPinnable, strSubType, strSubTypeId) {
		var strComment = $("#comments__post-textarea-" + strUid).val();
		var strAttachmentIds = $('#file_ids').val();
		
		if (strComment !== "") {
			$("#comments__post-textarea-" + strUid).parent().first().removeClass('has-error');
			cmsg("Posting...", 1, 0);
			$("#comments__post-textarea-" + strUid).attr('value', '');
			$('#attachment_ids-' + strUid).val('');
			$('#attachment_ids_container-' + strUid).hide(200);
			if ($('#feed_post').length > 0) {
				uploader.reset();
			}
			jQuery.ajax({
				type: "POST",
				cache: false,
				url: "/update_comments",
				data: { uid: strUid, type: strType, student_id: strStudentID, comment: strComment, attachment_ids: strAttachmentIds, sub_type: strSubType, sub_type_id: strSubTypeId },
				success: function () {
					jQuery.ajax({
						type: "GET",
						cache: false,
						url: "/ajax_comment_boot?ax=1",
						data: { uid: strUid, type: strType, pinnable: isPinnable },
						success: function (html) {
							$("#comments__post-" + strUid).before(html);
						}
					});
				}
			});
		} else {
			$("#comments__post-textarea-" + strUid).parent().first().addClass('has-error');
		}
	}

	/* Function triggered by clicking on the Like Button.
		* @param strUid                 : The UID of the item the likes are linked to.
		* @param strType                : The type of the item the likes are linked to.
		* @param strStudentID           : The student ID.
	*/
	function onLike(strUid, strType, strStudentID) {
		var likeIcon    = $("#like__icon-" + strUid);
		var likeCounter = $("#like__counter-" + strUid);
		var likeLink    = $(likeIcon).parent();
		//Heart Empty => It is a like
		if (likeIcon.hasClass("mdi-heart-outline")) {
			likeIcon.removeClass("mdi-heart-outline").addClass("mdi-heart");
			let oldLikes = '' + parseInt(likeCounter.html()) + ' likes.';
			var newCount = parseInt(likeCounter.html()) + 1;
			if (newCount == 1) {
				likeIcon.removeAttr("style");
				likeCounter.html(newCount).css("display", "inline-block");
			}
			else { 
				likeCounter.html(newCount).css("display", "inline-block");
			}
			onLikePost(strUid, strType, strStudentID, 1)
			let newLikes = '' + newCount + ' likes.';

			let linkAriaLabel = $(likeLink).attr('aria-label');
			linkAriaLabel = linkAriaLabel.replace('Click to like.', 'You liked this, click again to unlike.');
			if (linkAriaLabel.includes(' likes.')) {
				linkAriaLabel = linkAriaLabel.replace(oldLikes, newLikes);
			} else {
				linkAriaLabel = newLikes + ' ' + linkAriaLabel;
			}
			$(likeLink).attr('aria-label', linkAriaLabel);
		}
		//Heart Full => It is a dislike
		else if (likeIcon.hasClass("mdi-heart")) {
			likeIcon.removeClass("mdi-heart").addClass("mdi-heart-outline");
			let oldLikes = '' + parseInt(likeCounter.html()) + ' likes.';
			var newCount = parseInt(likeCounter.html()) - 1;
			if (newCount == 0) {
				likeIcon.attr("style", 'color: #aaa !important');
				likeCounter.html(newCount).css("display", "none");
			}
			else {
				likeCounter.html(newCount);
			}
			onLikePost(strUid, strType, strStudentID, 0)
			let newLikes = '' + newCount + ' likes.';

			let linkAriaLabel = $(likeLink).attr('aria-label');
			linkAriaLabel = linkAriaLabel.replace('You liked this, click again to unlike.', 'Click to like.');
			if (newCount == 0) {
				linkAriaLabel = linkAriaLabel.replace(oldLikes, '').trim();
			} else {
				linkAriaLabel = linkAriaLabel.replace(oldLikes, newLikes);
			}
			$(likeLink).attr('aria-label', linkAriaLabel);
		}
	}

	/* Function triggered by clicking the "View N previous replies" for feed posts with a lot of comments
		* @param strUid                 : The UID of the item the previous replies are linked to.
		*
		* NOTE previously defined in the onClick for the "View N previous replies" link; moved here to
		*      improve focus on click for accessibility (we want to focus on the first comment inside
		*      the newly expanded replies).
	*/
	function viewNPreviousReplies(strUid) {
		$('#old_comments_' + strUid).css('display','block');
		$('#show_old_comments_' + strUid).css('display','none');
		$('#hide_old_comments_' + strUid).css('display','block');
		// (Accessibility) Move keyboard focus to the first comment inside the newly expanded block
		let firstPreviousReply = $('#feed__post-comments-' + strUid).find('.media-heading--feed')[0];
		if (!isEmpty(firstPreviousReply)) {
			firstPreviousReply.focus();
		}
	}

	/* Function triggered by clicking on the Like Button.
		* @param strUid                 : The UID of the item the likes are linked to.
		* @param strType                : The type of the item the likes are linked to.
		* @param strStudentID           : The student ID.
		* @param isLike                 : 0 => Dislike / 1 => Like.
	*/
	function onLikePost(strUid, strType, strStudentID, isLike) {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_likes",
			data: { uid: strUid, type: strType, student_id: strStudentID, like: isLike },
			success: function () { /*Success*/ }
		});
	}

	/* Function used to check if the privacy settings of a post are set. 
	Uses schoolFeedPrivacy variable which is set in SocialPostBoot.ascx */       
	function isSetPostPrivacy() {
		var boolPrivacySet = false;

		if (schoolFeedPrivacy == 1) {
			if ($("#feed_type").val() == "feed" && schoolFeedAdmin == 1) {
				boolPrivacySet = true;
			}
			else if ($("#feed_type").val() == "discussion_posts") {
				boolPrivacySet = true;
			}
			else if ($("#feed_type").val() == "club") {
				boolPrivacySet = (($("#post_privacy_level").val() == 2 || $("#post_privacy_level").val() == 15) && $("#to_club_ids").val() != "");
			} else if ($("#feed_type").val() == "event") {
				boolPrivacySet = $("#post_privacy_level").val() == 1;
			}
		}
		else if ($("#feed_type").val() == "club") {
			boolPrivacySet = ( ($("#post_privacy_level").val() == 2 || $("#post_privacy_level").val() == 3 || $("#post_privacy_level").val() == 15) && $("#to_club_ids").val() != "");
		}
		else {
			boolPrivacySet = true;
		}
		return boolPrivacySet;
	}   

	/* Function used to hide Post Area. */
	function hidePostArea(param) {
		$("#social-post").css("display", "none");
		if (param == "admin") {
			$("#social-post__admin").css("display", "block");
			$("#social-post__infos").css("display", "none");
		}
		else if (param == "infos") {
			$("#social-post__infos").css("display", "block");
			$("#social-post__admin").css("display", "none");
		}
	}

	/* Function used to show Post Area. */
	function showPostArea() {
		$("#social-post__admin").css("display", "none");
		$("#social-post__infos").css("display", "none");
		$("#social-post").css("display", "block");
	}

	/* Function used to hide Post Controls. */
	function hidePostAreaControls() {
		$("#feed_post").css("height", "20px");
		$("#social-post__actions").slideUp('fast', 'swing');
	}

	/* Function used to show Post Controls. */
	function showPostAreaControls() {
		$("#feed_post").css("height", "auto");
		$("#social-post__actions").slideDown('fast', 'swing');
	}

	/* Function triggered by clicking on the Schedule Feed Button.*/
	function toggleFeedScheduling() {
		var socialPostScheduleCont = $("#social-post_schedule")
		if(!$(socialPostScheduleCont).is(":visible")) {
			$(socialPostScheduleCont).slideDown('fast', 'swing');
		}
		else {
			$(socialPostScheduleCont).slideUp('fast', 'swing');
		}
	};

	/* Function triggered by clicking on the Share With... Button.*/
	function toggleFeedShare() {
		openModal("/ajax_feed_privacy?ax=1&type=" + $("#feed_type").val() + "&type_id=" + $("#feed_type_id").val() + "&topic_id=" + $("#feed_topic_id").val()); 
		isPrivacyModalOpen = true;
	}

	/* Function to reset the Feed Share inputs */
	function resetFeedShare() {
		$("#post_privacy_level").val("0");
		$("#to_type_ids").val("");
		$("#to_people_tags").val("");
		$("#to_yogs").val("");
		$("#to_club_ids").val("");
		$("#btn_ajax_feed_privacy").attr("class", "btn btn-grey").html("<span class='mdi mdi-lock' aria-hidden='true' role='presentation'></span> Share with...");
	}

	/* Function triggered by switching between Post tabs (Status, Photos, Files, Link). Sets the value of input. */
	function setFeedSubType(type) {
		$("#post_element_sub_type").val(type);
	}

	/* Function triggered by clicking on the Post Feed Button. */
	function onFeedPost() {
		if ($("#feed_post").val() != "") {
			if (isSetPostPrivacy()) {
				$("#social-post__actions a").attr("disabled", true);
				
				cmsg("Posting...", 1, 0);
				var postElementSubType = $("#post_element_sub_type").val();
				var attachmentsIDs;
				if (postElementSubType == "doc") {
					attachmentsIDs = $("#attachment_ids").val()
				}
				if (postElementSubType == "photo") {
				   attachmentsIDs = $("#photo_ids").val();
				}
				var postLink;
				if ($("#link_link").is(":visible")) {
					postLink = $("#link_link").val();
				}
				else {
					postLink = $("#video_link").val();
				}

				jQuery.ajax({
					type: "POST",
					cache: false,
					url: "/ajax_feed_post",
					data: { post:                       1, 
							async:                      1,
							message:                    $("#feed_post").val(),
							post_link:                  postLink,
							feed_type:                  $("#feed_type").val(),
							feed_type_id:               $("#feed_type_id").val(),
							feed_topic_id:              $("#feed_topic_id").val(),
							post_element_sub_type:      $("#post_element_sub_type").val(),
							post_element_subtype_id:    $("#post_element_subtype_id").val(),
							post_privacy_level:         $("#post_privacy_level").val(),
							officers_only:              $("#officers_only").val(),
							to_type_ids:                $("#to_type_ids").val(),
							to_people_tags:             $("#to_people_tags").val(),
							to_yogs:                    $("#to_yogs").val(),
							to_club_ids:                $("#to_club_ids").val(),
							send_date:                  $("#send_date").val(),
							send_hour:                  $("#send_hour").val(),
							send_minute:                $("#send_minute").val(),
							send_ampm:                  $("#send_ampm").val(),
							attachment_ids:             attachmentsIDs,
							send_notifications:         $("#send_notifications").prop("checked"),
							_csrf:                      $("#_csrf").val()
						  },
					success: function () {
						$("#feed_post").val("");
						$("#link_link").val("");
						$("#video_link").val("");
						$("#post_element_sub_type").val("feed");
						$("#post_element_subtype_id").val("");
						$("#to_type_ids").val("");
						$("#to_people_tags").val("");
						$("#to_yogs").val("");
						$("#to_club_ids").val("");
						$("#send_date").val("");
						$("#send_hour").val("");
						$("#send_minute").val("");
						$("#send_ampm").val("");
						$("#attachment_ids").val("");
						$("#photo_ids").val("");
						$('.qq-upload-list').children().remove(); //Remove uploaded photos & files from upload area
						$('#fine-uploader__document .qq-gallery.qq-uploader:before').attr("content", "Drop documents here");
						$('#fine-uploader__photo .qq-gallery.qq-uploader:before').attr("content", "Drop photos here");
						jQuery.ajax({
							type: "GET",
							cache: false,
							url: "/ajax_feed_boot?ax=1&new_post=1&type=" + $("#feed_type").val() + "&type_id=" + $("#feed_type_id").val() + "&topic_id=" + $("#feed_topic_id").val(),
							data: { },
							success: function (html) {
								$(html).prependTo("#feed").hide().slideDown('slow', 'swing');
								$("#btn_ajax_feed_privacy").attr("class", "btn btn-grey").html("<span class='mdi mdi-lock' aria-hidden='true' role='presentation'></span> Share with...");
								hidePostAreaControls();
								$("#social-post__actions a").attr("disabled", false);
								$('#social-post .nav-tabs a:first').tab('show');
							}
						});

						// Allow to post directly without selecting a particular privacy.
						if($("#feed_type").val() == "club" && $("#feed_type_id").val() !== "") {
							$("#post_privacy_level").val(2);
							$("#to_club_ids").val($("#feed_type_id").val());
						}
					}
				});
			}
			else {
				alert('Please set the privacy of the post by clicking the "Share with..." button on the left of the "Post" button.');
			}
		} else {
			alert('Please enter something to share.');
		};
	};

	function reloadPosts() { 
		window.location.reload();
	}

	// General Variable indicating weither to reload the feed after a search.
	var hasFeedSearchBeenRan = false;

	/* Function used to check if we can toggle the social-post when clicking out. */
	function isEmptySocialPost() {
		if ( $("#feed_post").val() !== "" || 
			 $("#link_link").val() !== "" || 
			 $("#video_link").val() !== "" || 
			 $("#attachment_ids").val() !== "" || 
			 $("#photo_ids").val() !== "" || 
			 $("#to_type_ids").val() !== "" || 
			 $("#to_yogs").val() !== "" || 
			 $("#to_people_tags").val() !== "" || 
			 $("#to_club_ids").val() !== "" || 
			 $("#modal__feed-privacy").is(":visible") ) {
			return false; 
		}
		else { 
			return true;
		}
	}

	/* Function used to toggle the search bar for the feed. */
	function toggleFeedSearch() {
		if(!$("#feed-search__input").is(":visible")) {
			$("#feed-search__close-btn").animate({width:'toggle'},100, function() {
				$("#feed-search__input").animate({width:'toggle'},250).focus();
			});
			$("#feed-search__search-btn").removeClass("feed-search__round-btn").removeAttr("onclick").attr("onclick", "onFeedSearch()");
		}
		else {
			$("#feed-search__input").animate({width:'toggle'},250, function() {
				$("#feed-search__close-btn").animate({width:'toggle'},100);
				$("#feed-search__search-btn").addClass("feed-search__round-btn").removeAttr("onclick").attr("onclick", "toggleFeedSearch()");
			});
		}
	};

	/* Function used to search & reload the feed. */
	function onFeedSearch() {
		resetFeedShare();
		cmsg("Searching...", 1000, 0);
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&search=" + $("#feed-search__input").val() + "&type=" + $("#feed_type").val() + "&type_id=" + $("#feed_type_id").val() + "&topic_id=" + $("#feed_topic_id").val());
		hasFeedSearchBeenRan = true;
	}

	/* Function used to clear the search & reload the feed. */
	function clearFeedSearch() {
		$("#feed-search__input").val("");
		toggleFeedSearch();
		if(hasFeedSearchBeenRan) { 
			getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=" + $("#feed_type").val() + "&type_id=" + $("#feed_type_id").val() + "&topic_id=" + $("#feed_topic_id").val());
		}
		hasFeedSearchBeenRan = false;
	}

	/* Function triggered when a topic is selected.
		* @param topicID        : The topic ID, 0 being All Posts
		* @param topicName      : The topic name
		* @param topicIcon      : The topic icon
	*/
	function selectTopicFeed(topicID, topicName, topicIcon) {
		resetFeedShare();

		// 0 is All Posts
		if (topicID === 0) { 
			if (schoolFeedPrivacy == 1 && schoolFeedAdmin == 0) {
				hidePostArea("infos");
			}
			else {
				showPostArea();
			}
			$('#feed_post').attr("placeholder", "Start a new conversation");
			$("#feed_type").val("feed");
			$("#feed_type_id").val("");
			$("#feed_topic_id").val("");
			$("#feed-header").html("<span class='mdi mdi-clipboard-text'></span> General");
			getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=feed");
		}
		else { 
			if (schoolFeedPrivacy == 1 && schoolFeedAdmin == 0) {
				hidePostArea("infos");
			}
			else {
				showPostArea();
			}
			$('#feed_post').attr("placeholder", "Start a new conversation under " + topicName + "...");
			$("#feed_type").val("feed");
			$("#feed_type_id").val("");
			$("#feed_topic_id").val(topicID);
			$("#feed-header").html("<span class='" + topicIcon + "'></span> " + topicName.charAt(0).toUpperCase() + topicName.substr(1));
			getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=feed&topic_id=" + topicID);
		}

		// Remove new feeds counter.
		$("#topics__topic-" + topicID + " span.badge").remove();
	} 


	/* Function triggered when a topic from a group is selected.
		* @param topicID        : The topic ID, 0 being All Posts
		* @param topicName      : The topic name
		* @param topicIcon      : The topic icon
		* @param groupID        : The group ID
	*/
	function selectGroupTopicFeed(topicID, topicName, topicIcon, groupID) {
		resetFeedShare();

		// 0 is All Posts
		if (topicID === 0) { 
			if (schoolFeedPrivacy == 1 && schoolFeedAdmin == 0) {
				hidePostArea("infos");
			}
			else {
				showPostArea();
			}
			$('#feed_post').attr("placeholder", "Start a new conversation");
			$("#feed_type").val("feed");
			$("#feed_type_id").val("");
			$("#feed_topic_id").val("");
			$("#feed-header").html("<span class='mdi mdi-clipboard-text'></span> General");
			getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=feed");
		}
		else { 
			if (schoolFeedPrivacy == 1 && schoolFeedAdmin == 0) {
				hidePostArea("infos");
			}
			else {
				showPostArea();
			}
			$('#feed_post').attr("placeholder", "Start a new conversation under " + topicName + "...");
			$("#feed_type").val("club");
			$("#feed_type_id").val(groupID);
			$("#feed_topic_id").val(topicID);
			$("#feed-header").html("<span class='" + topicIcon + "'></span> " + topicName.charAt(0).toUpperCase() + topicName.substr(1));
			getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=club&type_id=" + groupID + "&topic_id=" + topicID);
		}

		// Remove new feeds counter.
		$("#topics__topic-" + topicID + " span.badge").remove();
	} 

	/* Function triggered when a event is selected.
		* @param eventId        : The event ID
		* @param eventName      : The event name
		* @param eventIcon      : The event icon
	*/
	function selectEventFeed(eventId, eventName, eventIcon) {
		resetFeedShare();

		showPostArea();

		// Allow to post directly without selecting a particular privacy.
		$("#post_privacy_level").val(1);
		$('#feed_post').attr("placeholder", "Start a new conversation");
		$("#feed_type").val("event");
		$("#feed_type_id").val(eventId);
		$("#feed-header").html("<span class='" + eventIcon + "'></span> " + eventName.charAt(0).toUpperCase() + eventName.substr(1));
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=event&type_id=" + eventId);

		// Remove new feeds counter.
		$("#topics__event-" + eventId + " span.badge").remove();
	}

	/* Function triggered when a group is selected.
		* @param groupID        : The group ID
		* @param groupName      : The group name
		* @param groupIcon      : The group icon
	*/
	function selectGroupFeed(groupID, groupName, groupIcon) {
		resetFeedShare();

		showPostArea();

		// Allow to post directly without selecting a particular privacy.
		$("#post_privacy_level").val(2);
		$("#to_club_ids").val(groupID);

		$('#feed_post').attr("placeholder", "Start a new conversation in " + groupName + "...");
		$("#feed_type").val("club");
		$("#feed_type_id").val(groupID);
		$("#feed-header").html("<span class='" + groupIcon + "'></span> " + groupName.charAt(0).toUpperCase() + groupName.substr(1));
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=club&type_id=" + groupID);

		// Remove new feeds counter.
		$("#topics__group-" + groupID + " span.badge").remove();
	}

	/* Function triggered when a forum post feed is selected.
		* @param discussionPostId        : The Forum Post ID
	*/
	function selectForumFeed(discussionPostId) {
		resetFeedShare();
		showPostArea();

		// Allow to post directly without selecting a particular privacy.
		$("#post_privacy_level").val(0);
		$("#to_club_ids").val('');

		$('#feed_post').attr("placeholder", "Comment on this forum post...");
		$("#feed_type").val("discussion_posts");
		$("#feed_type_id").val(discussionPostId);
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=discussion_posts&type_id=" + discussionPostId)
	}

	function selectAllFeeds() {
		resetFeedShare();

		//hidePostArea("admin");
		$("#post_privacy_level").val(0);

		$('#feed_post').attr("placeholder", "Start a new conversation");
		$("#feed_type").val("feed");
		$("#feed_type_id").val("");
		$("#feed_topic_id").val("");
		$("#feed-header").html("<span class='mdi mdi-clipboard-text'></span> All Posts");
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=all");
	}

	function selectCGFeeds() {
		resetFeedShare();

		//hidePostArea("admin");
		$("#post_privacy_level").val(0);

		$('#feed_post').attr("placeholder", "Start a new conversation");
		$("#feed_type").val("feed");
		$("#feed_type_id").val("");
		$("#feed-header").html("<span class='mdi mdi-clipboard-text'></span> All Posts");
		getContent("feed", "/ajax_feed_boot?ax=1&range=0&type=cg");
	}

	function selectEvents() {
		resetFeedShare();

		//hidePostArea("admin");
		$("#post_privacy_level").val(0);

		getContent("right-container", "/events?ax=1");
	}
	

/*-----------------------------------------------------*\
	@ALERT
\*-----------------------------------------------------*/
	/* Function called to display an alert-message in the container.
		* @param message  	: The message to display.
		* @param type (Opt) : The type of alert. eg: danger, warning. Default is info.
	*/
	function displayAlertMessage(message) {
		var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";

		var container = $(".content").length ? $(".content") : $(".container");

		if (container.length == 0) return;

		var messageBoxHtml = "<div class='alert alert-" + type + " alert-dismissible alert--top' role='alert' style='display: none;'>";
			messageBoxHtml += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>x</button>";
			messageBoxHtml += message;
		messageBoxHtml += "</div>";
		
		var element = $(messageBoxHtml);
		container.prepend(element);
		element.slideDown('fast', 'swing');;

		return;
	}

	/* Function called to display an alert-message in the container.
		* @param message  	 : The message to display.
		* @param containerEl : The HTML element to prepend the message to.
		* @param type (Opt)  : The type of alert. eg: danger, warning. Default is info.
	*/
	function displayAlertMessageInContainer(message, containerEl) {
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "info";

		if (containerEl.length == 0) return;

		var messageBoxHtml = "<div class='alert alert-" + type + " alert-dismissible alert--top' role='alert' style='display: none;'>";
			messageBoxHtml += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>x</button>";
			messageBoxHtml += message;
		messageBoxHtml += "</div>";
		
		var element = $(messageBoxHtml);
		containerEl.prepend(element);
		element.slideDown('fast', 'swing');;

		return;
	}




/*-----------------------------------------------------*\
	@ARIA
\*-----------------------------------------------------*/
	/* Function called to toggle the arai expanded attribute.
		* @param el  	: The element ID.
	*/
	function toggleAriaExpanded(el) {
		var element = document.getElementById(el);
		if (typeof element !== 'undefined' && element !== null) {
			var value = element.getAttribute("aria-expanded");
			if (value == "true") {
				element.setAttribute("aria-expanded", false);
			}
			else {
				element.setAttribute("aria-expanded", true);
			}
		}
	}




/*-----------------------------------------------------*\
	@OLD FUNCTIONS
\*-----------------------------------------------------*/

var editionEnCours = false;
var roomRes;
var iMouseDown = 0;
var iCellRoom = 0;
var iCellTime = 0;
var iCellEndTime = 0;
var iCR = 0;
var iCT = 0;
var iCET = 0;
var getcontent;
var getcontentparent;
var strPreventNavAway = 0;
var xhr;

function toggleSearchBox(openClose) {
	if (openClose == 1) {
		if ($('.searchbox > input').css('width') == '884px') {
			toggleSearchBox(0);
		} else {
			$('a.glass').fadeIn();
			$('.searchbox > input').animate({ width: "884px", height: "46px" }, 300, function () {
				$('.searchbox').addClass('active');
				$('.searchbox .close').animate({ width: "45px", height: "49px" }, 100);
				$('.searchbox > input').focus();
			});
		}
	} else {
		$('.searchbox > input').animate({ width: "0", height: "0" }, 300, function () {
			$('.searchbox').removeClass('active');
			$('.searchbox .close').animate({ width: "0", height: "0" }, 100);
			$('.searchbox > input').blur();
			$('.searchbox > input').val('');
			$('a.glass').fadeOut();
		});
	}
}

// Groups
$(document).ready(function () {
	$(document).bind('click', function (e) {
		var $clicked = $(e.target);
		if (!$clicked.parents('li').hasClass("gr_dropdown") && !$clicked.parents().hasClass("fav")) {
			$(".gr_dropdown .gr_list").hide();
		}
		else {
			$('#searchlist_groups_input').focus();
		}
		if (!$clicked.parents().hasClass("dd_notif")) {
			$(".dd_notif .subMenu").hide();
			$(".notif_dropdown_click").removeClass('active');
		}
		if (!$clicked.parents().hasClass("appli_dropdown")) {
			$(".appli_dropdown .subMenu").hide();
		}
		if (!$clicked.parents().hasClass("dd_account")) {
			$(".dd_account .subMenu").hide();
			$(".account_dropdown_click").removeClass('active');
		}
		if (!$clicked.parents('li').hasClass("events_dropdown") && !$clicked.parents().hasClass("fav")) {
			$(".events_dropdown .gr_list").hide();
			$(".events_dropdown_click").removeClass('active');
		}
		var $clicked = $(e.target);
		if (!$clicked.parents().hasClass("dd_support")) {
			$(".dd_support .subMenu").hide();
			$(".dd_support_click").removeClass('active');
			$('#support_message_loading').slideUp();
			$('#support_message_confirm').slideUp();
			$('#support_message_form').slideDown();
			$('#support_message_text').val('');
		}
		var $clicked = $(e.target);
		if (!$clicked.parents().hasClass("mob_menu")) {
			$(".mob_menu > .nav").hide();
			$(".mob_menu_click").removeClass('active');
		}
	});
});

// Notifications
$(document).ready(function () {
	$(".dd_notif > a").click(function () {
		$(".dd_notif .subMenu").toggle();
		$(".notif_dropdown_click").addClass('active');
	});

	$(".dd_notif ul a").click(function () {
		var text = $(this).html();
		$(".dd_notif .subMenu").hide();
		$(".notif_dropdown_click").removeClass('active');
	});
});

// Account
$(document).ready(function () {
	$(".dd_account > .account_dropdown_click").click(function () {
		$(".dd_account .subMenu").toggle();
		$(".account_dropdown_click").addClass('active');
	});

	$(".dd_account ul a").click(function () {
		var text = $(this).html();
		$(".dd_account .subMenu").hide();
		$(".account_dropdown_click").removeClass('active');
	});

});

// Support
$(document).ready(function () {
	$(".dd_support > a").click(function () {
		$(".dd_support .subMenu").toggle();
		$(".dd_support_click").addClass('active');
	});

	$(".dd_support ul a").click(function () {
		var text = $(this).html();
		$(".dd_support_click").removeClass('active');
	});


});

// Mobile right menu
$(document).ready(function () {
	$(".mob_menu > a").click(function () {
		$(".mob_menu > .nav").toggle();
		$(".mob_menu_click").addClass('active');
	});

	$(".appli_dropdown ul a").click(function () {
		var text = $(this).html();
		$(".mob_menu > .nav").hide();
		$(".mob_menu_click").removeClass('active');
	});


});


//===================================================================

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

//===================================================================

function hideshow(strId) {
	if ($('#' + strId).is(":visible")) {
		$('#' + strId).fadeOut();
	}
	else {
		$('#' + strId).fadeIn();
	}
}

//===================================================================

function getContent(strId, url) {
	var milliseconds = new Date().getTime();
	if (IsIEBrowser()) {
		//adds a random variable to the URL so IE stops caching requests
		if ((url.indexOf("&") != -1) && (url.indexOf('lcd8') > 0)) { console.log("ie"); }
		//if ((url.indexOf("&") != -1) && (url.indexOf('lcd8') > 0)) {url = url + "&_" + milliseconds} else {url = url + "?_" + milliseconds}
	}
	xhr = jQuery.ajax({
		url: url,
		success: function (html) {
			if (strId == "ajax_event_list"){
				var getEventWidgets = document.getElementsByClassName('ajax_event_list');
				for (var i = 0; i < getEventWidgets.length; i++) {
					getEventWidgets[i].innerHTML = html;
				}
			}
			if (document.getElementById(strId)) {
				if (IsIE8Browser()) {
					document.getElementById(strId).innerHTML = html;
				} else {
					$('#' + strId).css({ 'opacity': 0 });
					$('#' + strId).html(html).animate({ 'opacity': 1 }, 200);
				}
			}
			if (document.getElementById('generic')) {
				document.getElementById('generic').style.display = 'none';
			}

            const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore', {detail: { 'parentContainerId': strId }});
			document.dispatchEvent(ajaxLoadMoreEvent);
		},
		error: function (rep) {
			if (rep.status == 403) {
				//location.reload();
			}
		}
	});
}

function getContentNew(selector, url, onSuccess, onFail){
	jQuery.ajax({
		method: "GET",
		url: url,
	})
	.done(function( data ) {
		if(selector !== undefined && selector !== ""){
			$(selector).css({ 'opacity': 0 });
			$(selector).html(data).animate({ 'opacity': 1 }, 200);
		}
		if (onSuccess !== undefined && typeof onSuccess == 'function'){
			onSuccess(data);
            
            // selector may include CSS - ajaxLoadMore requires a container ID (pass parentContainerId:null to scan entire DOM - this is OK)
            const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore', {detail: { 'parentContainerId': null }});
			document.dispatchEvent(ajaxLoadMoreEvent);
		}
	})
	.fail(function( jqXHR, textStatus ) {
		if (onFail !== undefined && typeof onFail == 'function'){
			onFail(jqXHR, textStatus);
		}
	});
}

//===================================================================

function getContentNotif(strId, url) {
	var milliseconds = new Date().getTime();
	if (IsIEBrowser()) {
		//adds a random variable to the URL so IE stops caching requests
		if ((url.indexOf("&") != -1) && (url.indexOf('lcd8') > 0)) { console.log("ie"); }
		//if ((url.indexOf("&") != -1) && (url.indexOf('lcd8') > 0)) {url = url + "&_" + milliseconds} else {url = url + "?_" + milliseconds}
	}
	xhr = jQuery.ajax({
		url: url,
		success: function (html) {
			if (document.getElementById(strId)) {
				if (IsIE8Browser()) {
					document.getElementById(strId).innerHTML = html;
				} else {
					// var test = $('#' + strId).html(html).val();
					$('#' + strId).html(html).animate({ 'opacity': 1 }, 200);
				}

                const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore',{detail: { 'parentContainerId': strId }});
			    document.dispatchEvent(ajaxLoadMoreEvent);
			}
		}
	});

}

//===================================================================

function appendContent(strId, url) {
	url = url.replace('.aspx', '');
	getcontentparent = jQuery.ajax({
		url: url,
		success: function (html) {
			$('#' + strId).append(html);

            const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore', {detail: { 'parentContainerId': strId }});
			document.dispatchEvent(ajaxLoadMoreEvent);
		}
	});
}

//===================================================================

function appendContentWithCallback(strId, url, callbackFunction, callbackParameters) {
	url = url.replace('.aspx', '');
	getcontentparent = jQuery.ajax({
		url: url,
		success: function (html) {
			$('#' + strId).append(html);

			//Call the callbackFunction with the list of parameters
			callbackFunction.apply(this, callbackParameters);
		}
	});
}

//===================================================================

function getContentOver(strId, url) {

	if (xhr) { xhr.abort(); }
	url = url.replace('.aspx', '');
	document.getElementById('generic').style.display = 'inline-block';
	xhr = jQuery.ajax({
		url: url,
		success: function (html) {
			if (IsIE8Browser()) {
				document.getElementById(strId).innerHTML = html;
			} else {
				$('#' + strId).css({ 'opacity': 0 });
				$('#' + strId).html(html).animate({ 'opacity': 1 }, 200);
			}
			if (document.getElementById('generic')) {
				document.getElementById('generic').style.display = 'none';
			}

            const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore', {detail: { 'parentContainerId': strId }});
			document.dispatchEvent(ajaxLoadMoreEvent);
		}
	});
}

//===================================================================

function getContentParent(strId, url) {
	url = url.replace('.aspx', '');
	getcontentparent = jQuery.ajax({
		url: url,
		success: function (html) {
			$('#' + strId, window.parent.document).empty();
			$('#' + strId, window.parent.document).append(html);
			//window.parent.document.getElementById('generic').style.display = 'none';
		}
	});
}

// ====================================================================

//New getContent function that allows the use of a callback. It will be trigger once the ajax event is completed
var getContentWithCallback = function (strId, url, callbackFunction, callbackParameters) {
	jQuery.ajax({
		url: url,
		success: function (html) {
			if (document.getElementById(strId)) {
				if (IsIE8Browser()) {
					document.getElementById(strId).innerHTML = html;
				} else {
					$('#' + strId).css({ 'opacity': 0 });
					$('#' + strId).html(html).animate({ 'opacity': 1 }, 200);
				}
			}
			//Call the callbackFunction with the list of parameters
			callbackFunction.apply(this, callbackParameters);

            const ajaxLoadMoreEvent = new CustomEvent('ajaxLoadMore', {detail: { 'parentContainerId': strId }});
			document.dispatchEvent(ajaxLoadMoreEvent);
		}
	});
}

// ====================================================================
function IsIEBrowser() {
	var undef, rv = -1; // Return value assumes failure.
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf('MSIE ');
	var trident = ua.indexOf('Trident/');

	if (msie > 0) {
		// IE 10 or older => return version number
		rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	} else if (trident > 0) {
		// IE 11 (or newer) => return version number
		var rvNum = ua.indexOf('rv:');
		rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
	}

	return ((rv > -1) ? rv : undef);
}

// ====================================================================

function IsIE8Browser() {
	var rv = -1;
	var ua = navigator.userAgent;
	var re = new RegExp("Trident\/([0-9]{1,}[\.0-9]{0,})");
	if (re.exec(ua) != null) {
		rv = parseFloat(RegExp.$1);
	}
	return (rv == 4);
}



//===================================================================

function save_privacy(feed_id, type) {
	var officers_only = '';
	var to_type_ids = '';
	var to_yogs = '';
	var to_people_tags = '';
	var to_club_ids = '';
	var privacy_level = '';
	var id = "#privacy_lightbox_" + feed_id;


	if ($("#school_wide_radio_" + feed_id).is(':checked')) {
		$("#post_privacy_level").val("0");
		privacy_level = 0;
	}

	if ($("#members_radio_" + feed_id).is(':checked')) {
		$("#post_privacy_level").val("2");
		privacy_level = 2;
	}

	if ($("#student_type_radio_" + feed_id).is(':checked')) {
		$("#post_privacy_level").val("6");
		privacy_level = 6;
		$(id + " input:checkbox[name=to_type_ids]:checked").each(function () {
			to_type_ids += ',' + $(this).val();
		});
		$(id + " input:checkbox[name=to_yogs]:checked").each(function () {
			to_yogs += ',' + $(this).val();
		});
	}
	if ($("#people_tags_radio_" + feed_id).is(':checked')) {
		privacy_level = 9;
		$("#post_privacy_level").val("9");
		$(id + " input:checkbox[name=to_people_tags]:checked").each(function () {
			to_people_tags += ',' + $(this).val();
		});
	}
	if ($("#club_ids_radio_" + feed_id).is(':checked')) {
		privacy_level = 2;
		$("#post_privacy_level").val("2");
		$(id + " input:checkbox[name=to_club_ids]:checked").each(function () {
			if (to_club_ids == '') {
				to_club_ids = $(this).val();
			}
			else {
				to_club_ids += ',' + $(this).val();
			}
		});
	}
	if ($("#officers_radio_" + feed_id).is(':checked')) {
		privacy_level = 3;
		$("#post_privacy_level").val("3");
		officers_only = '1';
	}

	if (type == 'socialpost') {

		$("#to_type_ids").val(to_type_ids);
		$("#to_yogs").val(to_yogs);
		$("#to_people_tags").val(to_people_tags);
		$("#to_club_ids").val(to_club_ids);
		$("#officers_only").val(officers_only);

		// Passing value for poll privacy . Satnam Singh Date 11-14-2013
		$("#hdnTo_type_ids").val(to_type_ids);
		$("#hdnTo_yogs").val(to_yogs);
		$("#hdnTo_people_tags").val(to_people_tags);
		$("#hdnTo_club_ids").val(to_club_ids);
		$("#hdnOfficers_only").val(officers_only);
		$("#hdnSave_Privacy").val("1");

	}
	else if (type == 'feed') {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_feedprivacy.aspx",
			data: { feed_id: feed_id, officers_only: officers_only, to_type_ids: to_type_ids, to_people_tags: to_people_tags, to_yogs: to_yogs, to_club_ids: to_club_ids },
			success: function (data) {

			}
		});
	}
	else if (type == 'accessUser') {
		jQuery.ajax({
			url: "/div_access.aspx",
			data: { privacy_level: privacy_level, feed_id: feed_id, officers_only: officers_only, to_type_ids: to_type_ids, to_people_tags: to_people_tags, to_yogs: to_yogs, to_club_ids: to_club_ids },
			success: function (data) {
				self.parent.tb_remove();
			}
		});

	}

}


//===================================================================

function searchAutocomplete(itemId, tag_id, type) {
	$("#" + itemId).autocomplete("suggest_searchbox?searchpeople=1", {
		width: 462,
		dataType: 'json',
		highlight: false,
		scroll: true,
		scrollHeight: 300,
		parse: function (data) {
			var array = new Array();
			for (var i = 0; i < data.length; i++) {
				array[array.length] = { data: data[i], value: data[i].primary_field, result: data[i].primary_field };
			}
			return array;
		},
		formatItem: function (row) {
			var img = '';
			img = '<img src="' + row.pic + '"/>&nbsp;&nbsp;&nbsp;';
			if (row.third_field)
				return img + row.primary_field + " (" + row.secondary_field + ", " + row.third_field + ")";
			else
				return img + row.primary_field + " (" + row.secondary_field + ")";
		}
	}).result(function (event, selected) { updatePeopleList(tag_id, type, selected.redirect, selected.primary_field, 0); $("#" + itemId).val(""); });
}

//===================================================================

function searchpeoplemark(type, itemId, student_id, student_name, del, DBmessage) {
	// DBmessage : success -> remove link else error message
	$("#" + type + "_result_list").show();
	if (del == 0) {
		var append;
		if (DBmessage == "success") {
			append = '<a class="btnDelete" href=\'#\' onClick="javascript:updatePeopleList(' + itemId + ', \'' + type + '\',' + student_id + ', \'\', 1);"></a>';
			if (type == 'officers') {
				id_array.push(student_id);
				tag_id_array.push(itemId);
				type_array.push('notification_new_officer')
			}
			else if (type == 'members') {
				id_array.push(student_id);
				tag_id_array.push(itemId);
				type_array.push('notification_new_member')
			}
			else if (type == 'tags') {
				id_array.push(student_id);
				tag_id_array.push(itemId);
			}
		}
		else if (DBmessage == "member_success") {
			append = '<a href=\'#\' class="btnDelete" onClick="javascript:updatePeopleList(' + itemId + ', \'' + type + '\',' + student_id + ', \'\', 2);"></a>';
			id_array.push(student_id);
			tag_id_array.push(itemId);
			type_array.push('notification_new_member_officer')
		}
		else {
			append = '<span class="searchpeople_message">' + DBmessage + '</span>';
		}
		$("#added_" + type).append("<li id='person_" + student_id + "'><span id='result_" + type + student_id + "'></span>" + append + "</li>");
		$("#result_" + type + student_id).html(student_name);
	}
	else {
		for (var i = 0; i < id_array.length; i++) {
			if (id_array[i] == student_id) {
				id_array.splice(i, 1);
				type_array.splice(i, 1);
				break;
			}
		}
		if ($("#person_" + student_id).length) {
			$("#person_" + student_id).hide();
		}
		$("#result_" + type + student_id).hide();
	}
}

//===================================================================

function cancel_searchpeople(type, id_array, tag_id_array) {
	for (var i = 0; i < id_array.length; i++) {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_peoplelist.aspx",
			dataType: 'json',
			data: { type: type, tag_id: tag_id_array[i], student_id: id_array[i], del: 1 },
			success: function (data) {

			}
		});
	}
}

//==================================================================

function send_notifications(id_array, type_array) {
	for (var i = 0; i < id_array.length; i++) {
		jQuery.ajax({
			type: "POST",
			cache: false,
			url: "/update_peoplelist.aspx",
			dataType: 'json',
			data: { type: type_array[i], tag_id: 0, student_id: id_array[i], del: 0 },
			success: function (data) {

			}
		});
	}
}


//===================================================================

function updatePeopleList(tag_id, type, student_id, student_name, del) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/update_peoplelist.aspx",
		dataType: 'json',
		data: { type: type, tag_id: tag_id, student_id: student_id, del: del },
		success: function (data) {
			var message = data.message;
			searchpeoplemark(type, tag_id, student_id, student_name, del, message);
		}
	});

}

//===================================================================

function updateFavorite(message, student_id, id, type, like) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/update_favorites.aspx",
		data: { id: id, student_id: student_id, type: type, like: like },
		success: function () {
			// Confirmation message
		}
	});

}

//===================================================================

function favorite(object, itemClass, type, student_id) {

	var auxUid = (object.className).replace("bookmark_", "bookmark_star_").replace('btn ', '');
	auxUid = '.' + auxUid;
	var auxUid2 = (object.className).replace("bookmark_", "bookmark_data_").replace('btn ', '');
	auxUid2 = '.' + auxUid2;
	var mark = $(auxUid2).html();
	if (mark == "Star") {
		updateFavorite('Star', student_id, itemClass, type, 1);
		$(auxUid2).html("Unstar");
		$(auxUid).attr("src", "/images/Unstar.png");
		$(auxUid).attr("alt", "Remove from favorites");
		let parentLinkAccLabel = $(auxUid).parent().attr('aria-label');
		if (!isEmpty(parentLinkAccLabel)) {
			$(auxUid).parent().attr('aria-label', parentLinkAccLabel.replace('Add to favorites', 'Remove from favorites'));
		}
	} else {
		updateFavorite('Unstar', student_id, itemClass, type, 0);
		$(auxUid2).html("Star");
		$(auxUid).attr("src", "/images/Star.png");
		$(auxUid).attr("alt", "Add to favorites");
		let parentLinkAccLabel = $(auxUid).parent().attr('aria-label');
		if (!isEmpty(parentLinkAccLabel)) {
			$(auxUid).parent().attr('aria-label', parentLinkAccLabel.replace('Remove from favorites', 'Add to favorites'));
		}
	}

	favoriteCmsg(type, mark);
}



//===================================================================

function favoriteCmsg(type, mark) {
	if (type == 'event' && mark == 'Star') {
		cmsg('This event was added to your personal calendar feed.', 2, 0);
		if (window['refreshListEvents']) { refreshListEvents(); }
	}
	if (type == 'event' && mark == 'Unstar') {
		cmsg('This event was removed from your personal calendar feed.', 2, 0);
		if (window['refreshListEvents']) { refreshListEvents(); }
	}
	if (type == 'people' && mark == 'Star') {
		cmsg('This person was added to your short list.', 2, 0);
		if (window['refreshListPeople']) { refreshListPeople(); }
	}
	if (type == 'people' && mark == 'Unstar') {
		cmsg('This person was removed from your short list.', 2, 0);
		if (window['refreshListPeople']) { refreshListPeople(); }
	}
	if (type == 'group' && mark == 'Star') {
		cmsg('This group was added to your favorites.', 2, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
	if (type == 'group' && mark == 'Unstar') {
		cmsg('This group was removed from your favorites.', 2, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
	if (type == 'survey' && mark == 'Star') {
		cmsg('This survey will be placed on top of your surveys list next time you load the page.', 3, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
	if (type == 'survey' && mark == 'Unstar') {
		cmsg('This survey was removed from your favorites.', 2, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
	if (type == 'doc' && mark == 'Star') {
		cmsg('This document will be placed on top of your files list next time you load the page.', 3, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
	if (type == 'doc' && mark == 'Unstar') {
		cmsg('This document was removed from your favorites.', 2, 0);
		//if (window['refreshListGroups']) { refreshListGroups(); }
	}
}


//===================================================================

function updateLikes(message, student_id, uid, type, like) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/update_likes",
		data: { uid: uid, student_id: student_id, type: type, like: like },
		success: function () {
			// Confirmation message
		}
	});
}

function likemark(object, itemUid, type, student_id) {
	var mark = object.innerHTML;
	var auxUid = (object.id).replace("like_", "likes_");
	var auxUid2 = (object.id).replace("like_", "blue_like_");
	var number = document.getElementById(auxUid).innerHTML
	var texto;
	if (mark == "Like") {
		updateLikes('Liked', student_id, itemUid, type, 1);
		object.innerHTML = "Unlike";
		if (number / 1 == 0) { texto = "1"; } else { texto = (number / 1 + 1) }
		document.getElementById(auxUid).innerHTML = texto;
	} else {
		updateLikes('Unliked', student_id, itemUid, type, 0);
		object.innerHTML = "Like";
		if (number / 1 == 2) { texto = "1"; } else { texto = (number / 1 - 1) }
		document.getElementById(auxUid).innerHTML = texto;
	}
	$('#' + auxUid2).show();
}


//===================================================================

function updateComments(message, student_id, uid, type, comment) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/update_comments",
		data: { uid: uid, student_id: student_id, type: type, comment: comment },
		success: function () {
			getContent('comments_' + type + '_' + uid, 'ajax_comments?to_uid=' + uid + '&type=' + type);
		}
	});

}

//===================================================================

function commentmark(object, itemUid) {
	var number = $("#comment_number_" + itemUid).text();
	var texto;
	if (number / 1 == 0) { texto = "1"; } else { texto = (number / 1 + 1) }
	if (texto == "1") {
		$("#blue_number_" + itemUid).css('display', 'block');
	}
	$("#comment_number_" + itemUid).text(texto);
	/*
	var auxUid = (object.id).replace("comment_text_button_", "comment_number_");
	var auxUid2 = (object.id).replace("comment_text_button_", "blue_number_");
	var number = document.getElementById(auxUid).innerHTML
	var texto;
	if (number / 1 == 0) { texto = "1"; } else { texto = (number / 1 + 1) }
	document.getElementById(auxUid).innerHTML = texto;
	$('#' + auxUid2).show();
	*/
}


//===================================================================

function display_lightbox(strUid, type) {
	$("#lightbox_" + strUid).show();
	if (type == 'comments') {
		$("#comment_lightbox_" + strUid).show();
		$("#comment_block_" + strUid).show();
		$("#comment_text_button_" + strUid).show();
	}
	else if (type == "privacy") {
		$("#privacy_lightbox_" + strUid).show();
	}
	else if (type == "online_now") {
		$("#online_now").show();
	}
	else if (type == "manage") {
		$("#popup_manage").show();
	}
	else if (type == "photo") {

		$("#comment_" + "_lightbox_" + type + "_" + strUid).show();
	}
	else if (type != "") {
		$("#" + type + "_lightbox_" + strUid).show();
	}
}



//===================================================================

function hide_lightbox(strUid, type) {
	$("#lightbox_" + strUid).hide();
	if (type == 'comments') {
		$("#comment_lightbox_" + strUid).hide();
	}
	else if (type == 'privacy') {
		$("#privacy_lightbox_" + strUid).hide();
	}
	else if (type == "popup_online") {
		$("#popup_online").hide();
	}
	else if (type == "manage") {
		$("#popup_manage").hide();
	}
	//else if (type == "photo") {
	//    $("#comment_" + "_lightbox_" + type + "_" + strUid).hide();
	//}
	else if (type != '') {
		$("#" + type + "_lightbox_" + strUid).hide();
	}
}

//===================================================================

function postContent(obj, strId, url) {
	var parameters;
	parameters = '';
	for (var i = 0; i < obj.elements.length; ++i) {
		var cobj = obj.elements[i];
		if (cobj.type == 'radio' || cobj.type == 'checkbox') {
			if (cobj.checked) {
				parameters = parameters + cobj.name + '=' + encodeURIComponent(cobj.value) + '&';
			}
		}
		else {
			parameters = parameters + cobj.name + '=' + encodeURIComponent(cobj.value) + '&';
		}
		//alert(cobj.name+' = '+cobj.value);
	}
	parameters = parameters + '1=1';
	//confirmMessage(obj, 'Posting Data...');
	document.getElementById('generic').style.display = 'none';
	return jQuery.ajax({
		type: "POST",
		cache: false,
		url: url,
		data: parameters,
		success: function (html) {
			if (strId) {
				jQuery('#' + strId).empty();
				jQuery('#' + strId).append(html);
			}
		}
	});
}

//===================================================================

function submitTag(obj, strId, url) {
	var parameters;
	parameters = '';
	for (var i = 0; i < obj.childNodes.length; ++i) {
		var cobj = obj.childNodes[i];
		//console.log(cobj.tagName);
		if (cobj.type == 'radio' || cobj.type == 'checkbox') {
			if (cobj.checked) {
				parameters = parameters + cobj.name + '=' + encodeURIComponent(cobj.value) + '&';
			}
		}
		else if (cobj.type == 'select') {
			parameters = parameters + cobj.name + '=' + encodeURIComponent(cobj.options[cobj.selectedIndex].value) + '&';
		}
		else {
			parameters = parameters + cobj.name + '=' + encodeURIComponent(cobj.value) + '&';
		}
		//alert(cobj.name+' = '+cobj.value);
	}
	parameters = parameters + '1=1';
	//confirmMessage(obj, 'Posting Data...');
	//console.log('HERE: ' + url);
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: url,
		data: parameters,
		success: function (html) {
			if (strId) {
				jQuery('#' + strId).empty();
			}
			jQuery('#' + strId).append(html);
		}
	});
	//document.getElementById('generic').style.display = 'none';
}


//=====================================================================

function toggleRanking(e, id) {
	if (e.checked) {
		document.getElementById(id).value = e.value;
	}
	else {
		document.getElementById(id).value = '';
	}
}


//=====================================================================

function checkAllCheckboxes(name) {
	aux = document.getElementById(name);
	nbs = aux.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		nbs[x].checked = true;
	}
	return false;
}

function uncheckAllCheckboxes(name) {
	aux = document.getElementById(name);
	nbs = aux.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		nbs[x].checked = false;
	}
	return false;
}

function uncheckReableAllCheckboxes(name) {
    aux = document.getElementById(name);
    nbs = aux.getElementsByTagName("input");
    for (x = 0; x < nbs.length; x++) {
        nbs[x].checked = false;
        nbs[x].disabled = false;
    }
    return false;
}

function checkDisableAllCheckboxes(name) {
	aux = document.getElementById(name);
	nbs = aux.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		nbs[x].checked = true;
		nbs[x].disabled = true;
	}
	return false;
}

function uncheckDisableAllCheckboxes(name) {
	aux = document.getElementById(name);
	nbs = aux.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		nbs[x].checked = false;
		nbs[x].disabled = false;
	}
	return false;
}

function checkAllType(type) {
	nbs = document.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		if ((" " + nbs[x].className + " ").replace(/[\n\t]/g, " ").indexOf(" " + type + " ") > -1) {
			nbs[x].checked = true;
		}
	}
	return false;
}

function uncheckAllType(type) {
	nbs = document.getElementsByTagName("input");
	for (x = 0; x < nbs.length; x++) {
		if ((" " + nbs[x].className + " ").replace(/[\n\t]/g, " ").indexOf(" " + type + " ") > -1) {
			nbs[x].checked = false;
		}
	}
	return false;
}

//==============================================================

function getPosition(element) {
	var left = 0;
	var top = 0;
	/*On r�cup�re l'�l�ment*/
	var e = document.getElementById(element);
	/*Tant que l'on a un �l�ment parent*/
	while (e.offsetParent != undefined && e.offsetParent != null) {
		/*On ajoute la position de l'�l�ment parent*/
		left += e.offsetLeft + (e.clientLeft != null ? e.clientLeft : 0);
		top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
		e = e.offsetParent;
	}
	return new Array(left, top);
}

//==============================================================================
//ts en ms
function timestamp() {
	var date = new Date();
	return date.getTime();
}

//==============================================================================

function setWhiteThickbox() {
	//$('#TB_overlay').css('background-color', '#fcfcfc');
	$('#TB_overlay').css('opacity', '0.4');
	$('#TB_window').css('border', '1px solid #535353');
	$('#TB_window').css('box-shadow', '0 4px 16px rgba(0,0,0,.2)');
	$('#TB_ajaxContent').css('width', 'auto');
	$('#TB_ajaxContent').css('height', 'auto');
	$('#TB_ajaxContent').css('max-height', '570px');
	$('#TB_ajaxContent').css('overflow', 'auto');
}

function getRoomDetails() {
	if (document.getElementById("room_id")) {
		var e = document.getElementById("room_id");
		var strId = e.options[e.selectedIndex].value;
		getContent('room_details', '/ajax_room_details?room_id=' + strId);
	}
}

//=================================================================================
var localObj;

var xhrDataModel;
function setValue(objectName, id, updates, url, callback) {

	localObj = JSON.parse(JSON.stringify(window[objectName]));
	updates = JSON.parse(updates.replace(/\r?\n/g, "\\n"));
	if (id != '-1') {
		var i = 0; var exit = 0;
		while (i < window['localObj'].items.length && exit == 0) {
			if (window['localObj'].items[i].id.val == id) {
				for (var fieldName in updates) {
					window['localObj'].items[i][fieldName].val = updates[fieldName];
					window['localObj'].items[i][fieldName].u = 1;
				}
				exit++;
			}
			i++;
		}
	} else {
		window['localObj'].items[0].id.val = '-1';
		for (var fieldName in updates) {
			window['localObj'].items[0][fieldName].val = updates[fieldName];
			window['localObj'].items[0][fieldName].u = 1;
		}
	}
	cleanItems(url, 'localObj', callback);
}

function cleanItems(url, objectName, callback) {
	var i = 0; var updated; var status;
	while (i < window[objectName].items.length) {
		updated = 0;
		for (field in window[objectName].items[i]) {
			if (window[objectName].items[i][field].u == 1) {
				updated += 1;
			}
			else {
				if (field != 'id') {
					window[objectName].items[i][field].val = '';
				}
			}
		}
		if (updated == 0) { window[objectName].items.splice(i, 1); i -= 1; }
		i++;
	}
	sendObject(url, objectName, callback);
}

function sendObject(url, objectName, callback) {
	$.post(url, { object: JSON.stringify(window[objectName]) }, function (data) {
		callback(data);
	});
}


function getDataJSON(url, objectName, subLevel, callback, noResultCallback) {
	if (url.indexOf('?') > 0) { url = url + '&' + timestamp(); } else { url = url + '?' + timestamp(); }
	$.getJSON(url, function (data) {
		if (data.length > 0) {
			if (subLevel != '') {
				window[objectName] = data[0][subLevel];
				if (data[0][subLevel].length == 0) {
					noResultCallback();
					return true;
				}
			}
			else {
				window[objectName] = data;
			}
			if (window[objectName].length == 0) {
				noResultCallback();
			}
			for (var i = 0; i < window[objectName].length; i++) {
				callback(window[objectName][i]);
			}
			tb_init('a.ltb');
			$('[data-toggle="tooltip"]').tooltip();
		}
		else {
			noResultCallback();
		}
	});
}

var searchListTimeout;
function searchList(objectName, fieldName, q, callback, containerId, noResult, callUrl, subType) {
	var k = 0;
	var lExit = 0;
	var ids = '';
	q = q.toLowerCase();
	if (document.getElementById(containerId)) {
		if (IsIE8Browser()) {
			// innerText instead of innerHTML for IE8 <table> Bug - MM 8/13/2013
			document.getElementById(containerId).innerText = '';
		} else {
			document.getElementById(containerId).innerHTML = '';
		}
	}
	var fieldList = fieldName.split(',');
	clearTimeout(searchListTimeout);
	for (var i = 0; i < window[objectName].length; i++) {
		lExit = 0;
		for (var j = 0; j < fieldList.length; j++) {
			if (lExit == 0) {
				if (window[objectName][i][fieldList[j]].toLowerCase().indexOf(q.replace(' ', '&nbsp;')) != -1) {
					callback(window[objectName][i]);
					ids = ids + window[objectName][i].id + ','
					k += 1;
					lExit = 1;
				}
			}
		}
	}
	if (callUrl.length > 0 && q.length > 0) {
		if (q.length > 2 || k == 0) {
			callUrl = (k == 0) ? (callUrl + '&limit=50') : callUrl;
			ids = (k == 0) ? 0 : ids;
			searchListTimeout = setTimeout('searchListCallUrl("' + callUrl + '", "' + ids + '",' + k + ',' + callback + ',' + noResult + ',"' + subType + '")', 500);
		}
	}
	if (k == 0 && q.length == 0) {
		noResult();
	}
}

function searchListCallUrl(callUrl, ids, k, callback, noResult, subType) {
	$.getJSON(callUrl + '&current_ids=' + ids, function (data) {
		for (var j = 0; j < data[0][subType].length; j++) {
			callback(data[0][subType][j]);
			k += 1;
		}
		if (k == 0) {
			noResult();
		}
	});
}

function writeDate(updatedOn) {
	updatedOn = updatedOn.split(' ');
	return updatedOn(0);
}

//Google methods experiment (using DOM core functions) MM 5/28

//p: parent element
//h: innerHTML
//i: id
//c: className
function ul(p, h, i, c) {
	var t = document.createElement("ul");
	t.id = i;
	t.className = c;
	t.innerHTML = h;
	p.appendChild(t);
	return t;
}

function li(p, h, i, c) {
	var t = document.createElement("li");
	t.id = i;
	t.className = c;
	t.innerHTML = h;
	p.appendChild(t);
	return t;
}

function div(p, h, i, c) {
	var t = document.createElement("div");
	t.id = i;
	t.className = c;
	t.innerHTML = h;
	if (p) { p.appendChild(t); }
	return t;
}

function td(p, h, i, c) {
	var t = document.createElement("td");
	t.id = i;
	t.className = c;
	t.innerHTML = h;
	p.appendChild(t);
	return t;
}

function span(p, h, i, c) {
	var t = document.createElement("span");
	t.id = i;
	t.className = c;
	t.innerHTML = h;
	p.appendChild(t);
	return t;
}
// END Google methods experiment (using DOM core functions) MM 5/28


function tipInfo(e, id, topOffset) {
	$(e).mouseover(function () {
		$(id).css('left', $(this).offset().left + 'px');
		$(id).css('top', $(this).offset().top + topOffset + 'px');
		$(id).show();
	});
	$(e).mouseout(function () {
		$(id).css('display', 'none');
	});
}

var cumulativeOffset = function (element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	return {
		top: top,
		left: left
	};
};

//Time functions
function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}


//--------------------------- SEARCH PEOPLE ----------------------------

var peopleSearch;
function searchPeople(responseId, q, url, callback, noResult) {
	if (!q.length > 0) { $('#' + responseId).html(''); }
	$.getJSON(url, { q: q }, function (data) {
		peopleSearch = data;
		searchList('peopleSearch', 'primary_field,secondary_field', q, callback, responseId, '', '', '');
	});
}

// ----------------------------------------------------------------------
function removeSuggestEvent(e, eventId) {
	$(e).parents('div.w_list_item').addClass('remove');
	$(e).parents('div.w_list_item').slideUp('fast', function () { $('div.remove').remove(); });
	$('div#block_order_5 div.last').slideDown('fast');
	var a = 0;
	for (var k = 0; k < document.getElementsByName('suggested_events_current_ids[]').length; k++) {
		a += ',' + document.getElementsByName('suggested_events_current_ids[]')[k].value;
	}
	$.get('/ajax_suggested?type=events&action=remove&number=1&id=' + eventId + '&current_ids=' + a, function (data) {
		if (!document.getElementById('noEvent')) {
			$('#block_order_5').append(data);
			$('div#block_order_5 div.w_list_item:hidden').addClass('last');
		}
	});
}

//-----------------------------------------------------------------------
function budget_item_calculate(index) {
	var qty = document.getElementsByName('qty_' + index)[0].value;
	var unit = document.getElementsByName('unit_' + index)[0].value;
	qty = (qty) ? parseFloat(qty) : 0;
	unit = (unit) ? parseFloat(unit) : 0;
	if ((qty * unit).toString() != 'NaN') {
		document.getElementsByName('amount_' + index)[0].value = (qty * unit);
	} else {
		document.getElementsByName('amount_' + index)[0].value = 0;
	}
}

//---------------------------------------------------------------------

function truncateText(str, l) {
	var s;
	if (str.length > l) {
		s = str.substring(0, l - 3) + '...';
	} else {
		s = str;
	}
	return s;
}

//-------------------------------------------------------------------
// WritePhotoTools() actionOnPage

function actionOnPage(uniqueId, bSimpleUpload, tagTargetId, imgOrBackground, inputToFillWithIds, ajaxCropType, nbFilesLimit, serverResponse, extraJS) {

	var response = JSON.parse(serverResponse);
	//show all options in dropdown (+ delete and crop) (case: there was no photo before)
	if (document.getElementById('delete_' + uniqueId)) { $('#delete_' + uniqueId).parent().removeClass('hidden'); }
	if (document.getElementById('crop_' + uniqueId)) {
		$('#crop_' + uniqueId).parent().removeClass('hidden');
		$('#crop_' + uniqueId).attr('href', '/ajax_crop_popup?unique_id=' + uniqueId + '&file_id=' + response[0].fileId + '&type=' + ajaxCropType + '&modal=true&width=200');
	}
	for (i = 0; i < response.length; i++) {
		var fileName = response[i].fileName;
		var fileId = response[i].fileId;


		//--------------------------------------------------
		// Whether we should place the image in background or not
		//--------------------------------------------------
		if (imgOrBackground == 'img') {

			//test if element $(#id) is a <div> or an <img>, (To know then: do we have to add the <img> tag inside the div?)
			if ($('#' + tagTargetId).get(0).tagName == 'DIV') {
				//It's a div and we want an img: we add <img> tag
				if (nbFilesLimit == 1) {
					//If only 1 file to upload, we have to replace the photo, else we add it.
					$('#' + tagTargetId).html('<img class="flyer" src="' + fileName + '"/>');
				} else {
					$('#' + tagTargetId).append('<img class="flyer" src="' + fileName + '"/>');
				}
			} else if ($('#' + tagTargetId).get(0).tagName == 'IMG') {
				//It's already an <img>, so we just update the source
				$('#' + tagTargetId).attr('src', fileName + '?ts=' + timestamp());
			}
		} else if (imgOrBackground == 'background') {
			$('#' + tagTargetId).css('background-image', 'url(' + fileName + ')');
		}

		//We show the element if it was in display:none
		if ($('#' + tagTargetId).is(':hidden')) {
			$('#' + tagTargetId).show();
		}
		//We show the parent element if it was in display:none
		if ($('#' + tagTargetId).parent().is(':hidden')) {
			$('#' + tagTargetId).parent().show();
		}

		//Adding ids into input value
		if (inputToFillWithIds != '') {
			if (document.getElementById(inputToFillWithIds)) {
				if (nbFilesLimit == 1) {
					//If only 1 file to upload, we have to replace the photo_id, else we add it.
					$('#' + inputToFillWithIds).val(fileId);
				} else {
					var comma = ',';
					if ($('#' + inputToFillWithIds).val() == '') { comma = ''; }
					var inputValue = $('#' + inputToFillWithIds).val();
					$('#' + inputToFillWithIds).val(inputValue + comma + fileId);
				}
			}
		}

		if (extraJS != '') {
			//writePhotoToolsCallback('feed_photos');
		}

	} //End of main js else
	if (document.getElementById('progressBarUpload_' + tagTargetId)) {
		$('#progressBarUpload_' + tagTargetId).css('display', 'none');
		$('#progressBarUpload_' + tagTargetId).css('width', '10px');
	}
	start = 0;
	if (bSimpleUpload) {
		$('#labelUpload_' + uniqueId).html('" & strTitleButton & "');
		if (document.getElementById('infoUpload_' + tagTargetId)) {
			$('#infoUpload_' + tagTargetId).html('');
		}
	} else {
		$('#labelUpload_' + uniqueId).html('Upload');
	}
	//Hidding the list of buttons (Select - Upload - Edit current)
	$('#uploadToolsList_' + uniqueId).hide();
	return false;
} //End of function


function writePhotoToolsCallback(type) {
	if (type == 'feed_photos') {
		//autoPostSubType = 'photo';
	}
}

//====================================================

function writePhotoTools_delete(uniqueId, table, field, recordId) {
	cmsg('Deleting...', 2, 0);
	$.get('/ajax_delete_file?unique_id=' + uniqueId + '&table=' + table + '&field=' + field + '&record_id=' + recordId, function (data) {
		var response = JSON.parse(data);
		if (response[0].success == "true") {
			var callback = 'actionOnPage_' + uniqueId;
			window[callback](response);
			cmsg(response[0].message, 2, 0);
			if (document.getElementById('delete_' + uniqueId)) { $('#delete_' + uniqueId).parent().addClass('hidden'); }
			if (document.getElementById('crop_' + uniqueId)) { $('#crop_' + uniqueId).parent().addClass('hidden'); }
			if (document.getElementById('rotate_' + uniqueId)) { $('#rotate_' + uniqueId).parent().addClass('hidden'); }
			$('.editPhotoDiv').hide();
		} else {
			cmsg(response[0].message, 8, 0);
		}
	});
}

function writePhotoTools_rotate(uniqueId, currentPhotoId, size) {
	cmsg('Rotating...', 15, 0);
	$.get('/ajax_rotate?unique_id=' + uniqueId + '&id=' + currentPhotoId + '&size=' + size + '&ts=' + timestamp(), function (data) {
		var response = JSON.parse(data);
		if (response[0].success == "true") {
			var callback = 'actionOnPage_' + uniqueId;
			var actionTimeout = setTimeout(function () {
				window[callback](response);
				cmsg(response[0].message, 2, 0);
				$('.editPhotoDiv').hide();
			}, 2000);
		} else {
			cmsg(response[0].message, 8, 0);
		}
	});
}


function tb_getPageSize() {
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w, h];
	return arrayPageSize;
}

function megaOverlay() {
	var WH = tb_getPageSize();
	var p = document.getElementsByTagName('body')[0];
	var e = div(p, '', 'megaOverlay', '');
	var e2 = div(p, '<img src="/images/loader-big.gif" alt=""/> Please wait...<br/>', 'megaOverlayInfo', '');
	div(e2, 'The image is resized to fit in the template.', '', 'moreInfo');
	if (!IsIE8Browser()) {
		div(e2, '<progress id="CKEProgress" value="0"></progress>', '', 'moreInfoProgress');
	}
	$(e).css('background-color', '#fff');
	$(e).css('opacity', '0');
	$(e).css('position', 'fixed');
	$(e).css('width', WH[0] + 'px');
	$(e).css('height', WH[1] + 'px');
	$(e).css('top', '0px');
	$(e).css('text-align', 'center');
	$(e).css('line-height', WH[1] + 'px');
	$(e).css('z-index', '100000');
	//$(e).html('<img src="/images/loader-big.gif" alt=""/>');
	$(e).animate({ 'opacity': '0.4' }, 300);
}

function smallMegaOverlay() {
	var WH = tb_getPageSize();
	var p = document.getElementsByTagName('body')[0];
	var e = div(p, '', 'megaOverlay', '');
	var e2 = div(p, '<img src="/images/loader-big.gif" alt=""/> Please wait...<br/>', 'megaOverlayInfo', '');
	div(e2, 'The image is resized to fit in the template.', '', 'moreInfo');
	$(e).css('background-color', '#fff');
	$(e).css('opacity', '0');
	$(e).css('position', 'fixed');
	$(e).css('width', WH[0] + 'px');
	$(e).css('height', WH[1] + 'px');
	$(e).css('top', '0px');
	$(e).css('text-align', 'center');
	$(e).css('line-height', WH[1] + 'px');
	$(e).css('z-index', '100000');
	//$(e).html('<img src="/images/loader-big.gif" alt=""/>');
	$(e).animate({ 'opacity': '0.4' }, 300);
}


//-----------------------------------------------------

function setAnswerOptionId(uid, val) {
	if (document.getElementById(uid + '_option_id')) {
		document.getElementById(uid + '_option_id').value = val;
	}
}

//----------------------------------------------------

function setAppliClass(name) {
	$('.appli_dropdown').removeClass('admin_dp');
	$('.appli_dropdown').removeClass('directory_dp');
	$('.appli_dropdown').removeClass('rooms_dp');

	$('.appli_dropdown').addClass('active');
	$('.appli_dropdown').addClass(name);
}

// ------------ OLD cg.js -----------------------------

function w_tabChange(divName, linkObject) {
	var x;
	var tabToShow = 0;
	var arrayLinks = document.getElementById(divName).getElementsByTagName("a");
	// set aria-selected=true for active tab (linkObject) and false for all other tabs
	$(arrayLinks).attr('aria-selected', 'false');
	$(linkObject).attr('aria-selected', 'true');
	// put all the active links as inactive and hide their tab
	for (x = 0; x < arrayLinks.length; x++) {
		arrayLinks[x].className = (arrayLinks[x].className).replace(" active", "");
		if (arrayLinks[x] == linkObject) {
			// put the current link as active and show its tab
			linkObject.className = linkObject.className + " active";
		}
	}
}

function w_showHideTabs(tab_id) {
	if (tab_id != active_tab) {
		$('#w_tab_' + active_tab).animate({ "height": "toggle", "opacity": "toggle" });
		$('#w_tab_' + tab_id).animate({ "height": "toggle", "opacity": "toggle" });
		active_tab = tab_id;
	}
}

function trim(value) {
	//Deletes spaces and return carriage
	var temp = value;
	var obj = /^(\s*)([\W\w]*)(\b\s*$)/;
	if (obj.test(temp)) { temp = temp.replace(obj, '$2'); }
	var obj = /  /g;
	while (temp.match(obj)) { temp = temp.replace(obj, " "); }
	return temp;
}

function confirmMessage(obj, message) {
	document.getElementById('generic').innerHTML = '';
	document.getElementById('generic').style.display = 'inline-block';
	document.getElementById('generic').innerHTML = '<img style="width:40px;vertical-align:middle" src="/images/loader-big.gif"/> Loading...';
	if (message.length < 20) {
		//document.getElementById('generic').style.width = '100px';
	}
	if (message == 'Loading...') {
		setTimeout("document.getElementById(\'generic\').style.display=\'none\';", 15000);
	}
	else {
		if (message.length > 50) {
			setTimeout("document.getElementById(\'generic\').style.display=\'none\';", 10000);
		}
		else {
			setTimeout("document.getElementById(\'generic\').style.display=\'none\';", 10000);
		}
	}
}

function cmsg(message, duration, loading_sign) {
	if (message == '') { message = 'Loading'; }
	if (document.getElementById('generic')) {
		document.getElementById('generic').innerHTML = '';
		if (loading_sign == 1) {
			document.getElementById('generic').innerHTML = '<img style="width:20px;margin-right:10px;vertical-align:middle" src="/images/loader-big.gif"/>' + message;
		} else {
			document.getElementById('generic').innerHTML = message;
		}

		if ($('#generic').attr("waiting") == null) {
			$('#generic').attr("waiting", 0);
		}

		document.getElementById('generic').style.display = 'inline-block';
		$('#generic').animate({ 'top': '0px' }, 400);

		$('#generic').attr("waiting", parseInt($('#generic').attr("waiting"), 10) + 1);
		setTimeout(function() {
			//document.getElementById('generic').style.display = 'none';
			$('#generic').attr("waiting", parseInt($('#generic').attr("waiting"), 10) - 1);
			if ($('#generic').attr("waiting") == 0) {
				$('#generic').animate({ 'top': '-90px' }, 300);
			}
		}, duration * 1000);
	}
}

function error_cmsg(message, duration, loading_sign){
	const generic = document.getElementById('generic');
	if(generic){
		generic.style.backgroundColor = "#CD4A47";
		cmsg(message, duration, loading_sign);
		setTimeout(function() {
			generic.style.backgroundColor = null;
		}, duration * 1000 + 400);
	}
}

function Left(str, n) {
	if (n <= 0)
		return "";
	else if (n > String(str).length)
		return str;
	else
		return String(str).substring(0, n);
}
function Right(str, n) {
	if (n <= 0)
		return "";
	else if (n > String(str).length)
		return str;
	else {
		var iLen = String(str).length;
		return String(str).substring(iLen, iLen - n);
	}
}

function toggle_ecg(idDetail, idCaller, idFocus) {
	if (document.getElementById(idDetail)) {
		var style = document.getElementById(idDetail).style;
		if (style.display == "none") {
			style.display = "block";
			if (!isEmpty(idCaller)) {
				var elem = document.getElementById(idCaller);
				if (!isEmpty(elem)) {
					elem.setAttribute('aria-expanded', true);
				}
			}
			if (!isEmpty(idFocus)) {
				// console.log('> FIND idFocus=' + idFocus);
				var focusElem = document.getElementById(idFocus);
				if (!isEmpty(focusElem)) {
					// console.log('> SET focus');
					focusElem.focus();
				}
			}
		} else {
			jQuery('#' + idDetail + '').fadeOut();
			if (!isEmpty(idCaller)) {
				var elem = document.getElementById(idCaller);
				if (!isEmpty(elem)) {
					elem.setAttribute('aria-expanded', false);
				}
				if (!isEmpty(idFocus)) {
					// we've just toggled CLOSED so we'll re-focus back to the caller link
					var focusElem = document.getElementById(idCaller);
					if (!isEmpty(focusElem)) {
						focusElem.focus();
					}
				}
			}
		}
	}
}

function toggle_ib_ecg(idDetail) {
	if (document.getElementById(idDetail)) {
		var style = document.getElementById(idDetail).style;
		if (style.display == "none") { style.display = "inline-block"; } else { jQuery('#' + idDetail + '').fadeOut(); }
	}
}

function toggle_i_ecg(idDetail) {
    if (document.getElementById(idDetail)) {
        var style = document.getElementById(idDetail).style;
        if (style.display == "none") { style.display = "inline"; } else { jQuery('#' + idDetail + '').fadeOut(); }
    }
}

function toggle_row(idDetail) {
	var style = document.getElementById(idDetail).style;
	style.display = (style.display == "none") ? "table-row" : "none";
}

function numbersOnly(e) {
	var unicode = e.charCode ? e.charCode : e.keyCode
	if (unicode != 8) { //if the key isn't the backspace key (which we should allow)
		if (unicode < 48 || unicode > 57) //if not a number
			return false //disable key press
	}
}

function changeClassBtn(intId, strTo) {
    var studentId = intId.replace("connect_btn_", "");

	if (document.getElementById(intId)) {
		if (strTo == "connect") {
			cmsg('Connection request sent.', 2);
			document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','pending');getContent('connection_sent', 'ajax_connect?disconnect=1&student_id=" + studentId + "');\" class='btn btn-cg--user btn--full-width' style='border-radius: 0 0 4px 4px;'>Pending Connection <span class='mdi mdi-close-circle'></span></a>";
		}
		// Used for connections
		//else if (strTo == "pending") {
		//	cmsg('Connection request cancelled.', 2);
		//	$('#' + intId).removeClass('row');
		//	document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','connect');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "');\" class=\"btn btn-success btn--full-width\" style='border-radius: 0 0 4px 4px;'><span class='mdi mdi-plus-circle'></span> Connect</a>";
		//}
		else if (strTo == "connected") {
			cmsg('Connection accepted.', 2);
			$('#' + intId).removeClass('row');
			document.getElementById(intId).innerHTML = "<a class=\"btn btn-cg--group btn--full-width\" href=\"/user_chat?sid=" + studentId + "\" style=\"border-radius: 0 0 4px 4px;\"><span class=\"mdi mdi-comment-text\"></span> Message</a>";
		}
		else if (strTo == "follow") {
		    $('#' + intId).removeClass('row');
		    document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','following');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-grey btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi-check-circle'></span> Connected</a>";
		}
		else if (strTo == "following") {
		    $('#' + intId).removeClass('row');
		    document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','follow');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&follow=1');\" class=\"btn btn-default btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi mdi-check-circle-outline'></span> Connect</a>";
		}
		else if (strTo == "pending") {
		    $('#' + intId).removeClass('row');
		    document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','request');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-cg--user btn--full-width\" style='border-radius: 0 0 4px 0;'>Pending <span class='mdi mdi-close-circle'></span></a>";
		}
		else if (strTo == "request") {
		    $('#' + intId).removeClass('row');
		    document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','pending');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&request=1');\" class=\"btn btn-default btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi mdi-check-circle-outline'></span> Connect</a>";
		}
		else if (strTo == "follow_ajax_profile") {
		    $('#' + intId).removeClass('row');
		    document.getElementById("ajax_profile_" + intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','following_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-cg--user btn--rounded btn--margin-right\"><span class='mdi mdi-check-circle'></span> Connected</a>";
		    window.parent.document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','following_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-grey btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi-check-circle'></span> Connected </a>";
		}
		else if (strTo == "following_ajax_profile") {
		    $('#' + intId).removeClass('row');
		    document.getElementById("ajax_profile_" + intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','follow_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&follow=1');\" class=\"btn btn-cg--user btn--rounded btn--margin-right\"><span class='mdi mdi mdi-check-circle-outline'></span> Connect</a>";
		    window.parent.document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','follow_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&follow=1');\" class=\"btn btn-default btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi mdi-check-circle-outline'></span> Connect </a>";
		}
		else if (strTo == "pending_ajax_profile") {
		    $('#' + intId).removeClass('row');
		    document.getElementById("ajax_profile_" + intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','follow_request_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-cg--user btn--rounded btn--margin-right\"><span class='mdi mdi-check-circle'></span> Pending</a>";
		    window.parent.document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','request');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&disconnect=1');\" class=\"btn btn-cg--user btn--full-width\" style='border-radius: 0 0 4px 0;'>Pending <span class='mdi mdi-close-circle'></span></a>";
		}
		else if (strTo == "follow_request_ajax_profile") {
		    $('#' + intId).removeClass('row');
		    document.getElementById("ajax_profile_" + intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','pending_ajax_profile');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&request=1');\" class=\"btn btn-success btn--rounded btn--margin-right\"><span class='mdi mdi mdi-check-circle-outline'></span> Connect</a>";
		    window.parent.document.getElementById(intId).innerHTML = "<a onclick=\"changeClassBtn('" + intId + "','follow');getContent('connection_sent', 'ajax_connect?student_id=" + studentId + "&request=1');\" class=\"btn btn-default btn--full-width\" style='border-radius: 0 0 4px 0;'><span class='mdi mdi mdi-check-circle-outline'></span> Connect</a>";
		}
	}
}

//show mouse over popup and send request to server to get detail for event
function ShowEventDetail(obj) {

	var showOn_ = $(obj).attr('showOn');
	var flickrFeedsCache = {};
	$(obj).poshytip({
		className: 'tip-darkgray',
		//offsetX: -350,
		//offsetY: 0,
		//alignX: 'left',
		showOn: showOn_,
		//alignTo: 'target',
		//alignTo: 'cursor',
		//offsetX: -80,
		//alignY: 'bottom',
		content: function (updateCallback) {
			var rel = $(this).attr('rel');
			if (flickrFeedsCache[rel] && flickrFeedsCache[rel].container)
				return flickrFeedsCache[rel].container;
			if (!flickrFeedsCache[rel]) {
				flickrFeedsCache[rel] = { container: null };
				var eventId = rel;
				$.getJSON('/mobile_ws/v17/mobile_calendar?calendarView=detail&id=' + eventId,
					function (data) {
						var container = $('<div/>').addClass('flickr-thumbs');
						$('<div/>')
							.append(GetEventTipHTML(data))
							.appendTo(container)
						// store the content in the cache
						// and call updateCallback() to update the content in the main tooltip
						updateCallback(flickrFeedsCache[rel].container = container);
						var obj = $(".flickr-thumbs").parent().parent();
						$(obj).attr('style', 'background-color:white !important');
						tb_init('a.thickbox');
					}
				);
			}
			return 'Loading detail...';
		}
	});
	tb_init('a.thickbox');
}

//get popup html
function GetEventTipHTML(data) {
	if (data.events.length > 0) {
		data = data.events[0];
		var title = data.title != null ? data.title : "";
		var eventAddress = data.event_address != null ? data.event_address : "";
		var eventZipCode = data.event_zipcode != null ? data.event_zipcode : "";
		var eventCity = data.event_city != null ? data.event_city : "";
		var eventState = data.event_state != null ? data.event_state : "";
		var eventLocation = data.event_location != null ? data.event_location : "";
		var eventAuthor = data.author_id != null ? data.author_id : "";
		var strEventDate = data.eventDate;
		var eventDate = Date.parse(data.eventDateStr);
		var eventEndDate = Date.parse(data.eventEndDateStr);
		var endTime = data.endTime != null ? data.endTime : "";
		var startTime = data.startTime != null ? data.startTime : "";
		var groupName = data.groupName != null ? data.groupName : "";
		var soldTickets = data.soldTickets != null ? data.soldTickets : 0;
		var description = data.eventDescription != null ? data.eventDescription : "";
		var eventFlyer = data.eventFlyer != null ? data.eventFlyer : "";
		var rsvp = data.rsvpLinkCalendar != null ? data.rsvpLinkCalendar : "";
		var groupURL = data.groupURL != null ? data.groupURL : "";
		var clubLogo = data.clubLogo != null ? data.clubLogo : "";
		var eventUID = data.eventUID != null ? data.eventUID : "";
		var canEdit = data.canEdit != null ? data.canEdit : false;
		var clubId = data.club_id != null ? data.club_id : "0";
		var favLink = data.favoriteLink != null ? data.favoriteLink : "";
		var registrationRequired = data.registrationRequired != null ? data.registrationRequired : "0";
		var strAddress = eventLocation;
		var stArray = [1, 21, 31];
		var ndArray = [2, 22];
		var rdArray = [3, 23];
		var thArray = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 25, 26, 27, 28, 29, 30];
		var eventDate_ = eventDate.getDate();
		var eventEndDate_ = eventEndDate.getDate();
		var eventDateSuffix;
		var eventEndDateSuffix;

		if (stArray.indexOf(eventDate_) > -1) {
			eventDateSuffix = "st ";
		}
		else if (ndArray.indexOf(eventDate_) > -1) {
			eventDateSuffix = "nd ";
		}
		else if (rdArray.indexOf(eventDate_) > -1) {
			eventDateSuffix = "rd ";
		}
		else if (thArray.indexOf(eventDate_) > -1) {
			eventDateSuffix = "th ";
		}


		if (stArray.indexOf(eventEndDate_) > -1) {
			eventEndDateSuffix = "st ";
		}
		else if (ndArray.indexOf(eventEndDate_) > -1) {
			eventEndDateSuffix = "nd ";
		}
		else if (rdArray.indexOf(eventEndDate_) > -1) {
			eventEndDateSuffix = "rd ";
		}
		else if (thArray.indexOf(eventEndDate_) > -1) {
			eventEndDateSuffix = "th ";
		}

		/*
		if (eventAddress != "" && eventAddress != null) {
			strAddress = strAddress + ',&nbsp;' + eventAddress + ',';
			if (eventAddress != "") {
				strAddress = strAddress + ',&nbsp;' + eventZipCode + '&nbsp;' + eventCity + ',&nbsp;' + eventState;
			}
		}
		*/
		var isMultipleDaysEvent = false;
		if (eventEndDate > eventDate) {
			isMultipleDaysEvent = true;
		}

		//Parent div
		html = "<div class='tipContent'>";
		//Event Name
		html += "<div style='float:left;width:100%'>";

		//fav button
		if (favLink != "") {
			html += "<div style='width: 6%;float: left;margin-top: 6px;'>" + favLink + "</div>";
		}

		html += "<div class='tipEventTitle'";


		if (canEdit == false) {
			if (favLink != "") {
				html += "style='width:94%'";
			}
			else {
				html += "style='width:100%'";
			}
		}
		else {
			if (favLink != "") {
				html += "style='width:79.5%'";
			}
		}

		html += ">";
	html += title;
		html += "</div>";
		//Edit Event
		var link = "javascript:void(0);";
		var editButton = "";
		if (eventUID != "") {
			link = "/officer_login_redirect?club_id=" + clubId + "&target=" + encodeURIComponent("/event_form2.aspx?uid=" + eventUID);
		}
		if (canEdit) {
			editButton = '<a style="margin-top:4px;margin-right:1px;float:right;" href="' + link + '" title="Edit event" class="cgb b_edit"><span></span></a>';

			html += "<div style='float:right;width:14%'>";
			html += editButton;
			html += "</div>";
		}

		html += "</div>";

		html += "<div class='line_bottom' style='float: left;width: 100%;'></div>";
		//Location
		html += "<div class='tipEventAddress'><div class='tipLocation'><img class='ico' src='/images/icon_location.png'></div>";
		html += "<div class='tipEAdress'><a class='thickbox' href='/ajax_map?location=" + strAddress.replace(/ /gi, "+") + "&embed=1&TB_iframe=true&ax=1&mode=set&modal=true&width=900&height=500' style='text-decoration:none;'>" + strAddress + "</a></div></div>";//width:85%;
		//Time
		html += "<div class='tipEventDateTime'><div style='float:left;width:4.5%;'><img src='/images/icon_date_time.png' class='ico floatLeft'/></div>";
		html += "<div class='tipEventDateTimeContent'>"
		if (isMultipleDaysEvent == false) {
			html += "<div class='tipEventDateTime_'>" + eventDate.clone().toString("dddd MMMM dd") + eventDateSuffix + eventDate.clone().toString("yyyy") + "<br />";
			html += startTime + " &#8211; " + endTime + "</div>";
		}
		else {
			html += "<div class='tipEventDateTime_'>" + eventDate.clone().toString("dddd MMMM dd") + eventDateSuffix + eventDate.clone().toString("yyyy") + " " + startTime + " &#8211; ";
			html += "<br />" + eventEndDate.clone().toString("dddd MMMM dd") + eventEndDateSuffix + eventEndDate.clone().toString("yyyy") + " " + endTime + "</div>";
		}

		if (parseInt(registrationRequired) > 0) {
			html += "<div class='tipRSVPContent'>"
			html += "<a class='btns btnEvents RSVPTipLink' href='" + rsvp + "'>RSVP</a></div>";
		}
		/////
		html += "</div>";
		html += "</div>";
		//Attendings
		if (data.attendees.length > 0) {
			html += "<div class='tipEventAttending'>ATTENDING</div>";
			html += "<div class='tipPhotosContent'>";// background:1px Blue;
			//Images inside
			if (data.attendees.length > 0) {
				for (var i = 0; i < data.attendees.length; i++) {
					var photoSrc = data.attendees[i].attendeesPhotosSrc;
					var attendeeUid = data.attendees[i].attendee_uid;
					html += "<div class='tipPhotos'>";
					html += "<a style='text-decoration:none;' target='_blank' href='/student_profile?uid=" + attendeeUid + "'><img style='width:100%;' alt='Coming' src='" + photoSrc + "' /></a>";
					html += "</div>";
				}
			}
			html += "</div>";
		}
		html += "<div class='line_bottom' style='float: left;width: 100%;'></div>";
		html += "<div style='width:100%;float:left;'>";
		if (clubLogo != "") {
			html += "<div class='floatLeft'><img class='logoImg' src='" + clubLogo + "' alt='logo' /></div>";
		}
		html += "<span class='tipHostedBy'>&nbsp;Hosted by:</span>";
		html += "<span class='tipEventClubName'><a href='" + groupURL + "' class='tipClubLnk' target='_blank'>" + groupName;
		if (eventAuthor != "") {
			html += " - " + eventAuthor;
		}
		html += "</a></span>";

		if (data.coHostClubList.length > 0) {
			html += "<span class='tipHostedBy'>&nbsp;Cohost by:</span>";
			html += "<span class='tipEventClubName'>";
			for (var i = 0; i < data.coHostClubList.length; i++) {
				html += "<a href='" + data.coHostClubList[i].url + "' class='tipClubLnk' target='_blank'>" + data.coHostClubList[i].clubName + "</a>, ";
			}
			html = html.substr(0, html.length - 2);
			html += "</span>";
		}

		html += "</div>";
		html += "<div class='line_bottom' style='float: left;width: 100%;margin-bottom :10px;'></div>";
		if (eventFlyer != "") {
			html += "<div class='flyerContent'><img src='" + eventFlyer + "' alt='Flyer' /></div>";
		}
		//Close parent div
		html += "</div>";
	}
	else {
		 html="<div>This event information is private.</div>";
	}
	return html;
}

/* Function used to add a subscription to a member.
* @param member_id : The student id
* @param subscription_id : The subscription id
* @param content_id : The id of the container for the getContent
*/
function updateMemberSubscription(member_id, subscription_id, content_id) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/add_member_subscription",
		data: { member_id: member_id, subscription_id: subscription_id },
		success: function () {
			getContent(content_id, 'ajax_member_subscription?member_id=' + member_id + '&subscription_id=' + subscription_id);
		}
	});
}



/* Function used to send JS notifications.
* @param notif_name : The name of the notification to send
* @param record_ids : The record ids
* @param sec_record_ids : The second record ids (optional)
* @param to_ids : Ids of user who will receive notification
* @param message : Message to send (optional)
* @param club_id : The club id (optional)
*/
function sendNotification(notif_name, record_ids, sec_record_ids, to_ids, message, club_id) {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/ajax_send_notification",
		data: { notif_name: notif_name, record_ids: record_ids, sec_record_ids: sec_record_ids, to_ids: to_ids, message: message, club_id: club_id},
		success: function () {
			cmsg("Notification sent", 1, 0);
		}
	});

}

function hex (c) {
	var s = "0123456789abcdef";
	var i = parseInt (c);
	if (i == 0 || isNaN (c))
	  return "00";
	i = Math.round (Math.min (Math.max (0, i), 255));
	return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
  }

  /* Convert an RGB triplet to a hex string */
  function convertToHex (rgb) {
	return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  }

  /* Remove '#' in color hex string */
  function trimHex (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

  /* Convert a hex string to an RGB triplet */
  function convertToRGB (hex) {
	var color = [];
	color[0] = parseInt ((trimHex(hex)).substring (0, 2), 16);
	color[1] = parseInt ((trimHex(hex)).substring (2, 4), 16);
	color[2] = parseInt ((trimHex(hex)).substring (4, 6), 16);
	return color;
  }

  function generateColor(colorStart,colorEnd,colorCount){

	  // The beginning of your gradient
	  var start 
	  if (colorStart != '') {
		  start = convertToRGB (colorStart);    
	  }
	  else {
		  start = convertToRGB (colorEnd);
		  start[0] = start[0] * 3;
		  start[1] = start[1] * 3;
		  start[2] = start[2] * 3;
	  }

	  // The end of your gradient
	  var end   = convertToRGB (colorEnd);    

	  // The number of colors to compute
	  var len = colorCount;

	  //Alpha blending amount
	  var alpha = 0.0;

	  var colorArrayTemp = [];
	  
	  for (i = 0; i < len; i++) {
		  var c = [];
		  alpha += (1.0/len);
		  
		  c[0] = start[0] * alpha + (1 - alpha) * end[0];
		  c[1] = start[1] * alpha + (1 - alpha) * end[1];
		  c[2] = start[2] * alpha + (1 - alpha) * end[2];

		  colorArrayTemp.push(convertToHex (c));
		  
	  }
	  return colorArrayTemp;
  }

function getUserLocation(callback) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(callback);
	} else { 
		alert("Geolocation is not supported by this browser.");
	}
}

/* Function used to reset the Demo platfrom.
*/
function resetDemo () {
	jQuery.ajax({
		type: "POST",
		cache: false,
		url: "/reset_demo.aspx",
		data: {},
		success: function () {
			cmsg("Demo reset", 1, 0);
		}
	});

}

/*-----------------------------------------------------*\
	@UTILITIES
\*-----------------------------------------------------*/
 function windowLocationReload() {
    window.location.reload();
 }

// --------------------------------------------------------------------------------
// Helper Functions
// --------------------------------------------------------------------------------

var newlineChar = '\n';

// --------------------------------------------------------------------------------
// async sleep - ex. await cgSleep(1000) to sleep for one second *** NO LONGER USED
// --------------------------------------------------------------------------------
function cgSleep(millis) {
	console.error('> SLEEP cgSleep(' + millis + ') no longer supported.');
	// return new Promise(resolve => setTimeout(resolve, millis));
}

// --------------------------------------------------------------------------------
// data validation and type checking
// --------------------------------------------------------------------------------
function isBigInt(x) {
	return typeof x === 'bigint';
}

function isBoolean(x) {
	return typeof x === 'boolean';
}

function isDate(x) {
	if (isEmpty(x)) {
		return false;
	} else if (!isObject(x)) {
		return false;
	} else if (isEmpty(x.now)) {
		return false;
	} else if (isEmpty(x.getTime)) {
		return false;
	} else if (isEmpty(x.getYear)) {
		return false;
	} else if (isEmpty(x.getMonth)) {
		return false;
	} else if (isEmpty(x.UTC)) {
		return false;
	}
	return true;
}

function isEmpty(x) {

	if (typeof x === 'undefined') {
		return true;
	} else if (x === null) {
		return true;
	} else if (typeof x === 'string' && x.trim().length < 1) {
		return true;
	}
	return false;
}

function isFunction(x) {
	return typeof x === 'function';
}

// console.error('> LOAD-TRACE scripts.js is loading...');

var ulcHexCharacters = '0123456789abcdefABCDEF';
function isHexCharacter(c) {
	if (isEmpty(c)) {
		return false;
	} else if (!isString(c)) {
		return false;
	}

	if (!ulcHexCharacters.includes(c)) {
		return false;
	}
}
function isHexString(s) {
	if (isEmpty(s)) {
		return false;
	} else if (!isString(s)) {
		return false;
	}

	for (var i = 0; i < s.length; i++) {
		if (!isHexCharacter(s.charAt(i))) {
			return false;
		}
	}

	return true;
}

function isNull(x) {
	if (isUndefined(x)) {
		console.error('x is undefined');
		return;
	}
	return x === null;
}

function isNumber(x) {
	return typeof x === 'number' && !isNaN(x);
}

function isNumberBoolean(x) {
	// return true if x is a number and is either zero or one
	if (!isNumber(x)) {
		return false;
	}
	return x === 0 || x === 1;
}

function isObject(x) {
	return typeof x === 'object';
}

function isPrimitive(x) {
	//
	// return true if x is a JavaScript primitive data type
	//
	if (isBigInt(x)) {
		return true;
	} else if (isBoolean(x)) {
		return true;
	} else if (isFunction(x)) {
		// functions are treated as primitives in this implementation
		return true;
	} else if (isNumber(x)) {
		return true;
	} else if (isString(x)) {
		return true;
	} else if (isSymbol(x)) {
		return true;
	} else if (isUndefined(x)) {
		return true;
	}

	return false;
}

function isString(x) {
	return typeof x === 'string';
}

function isStringBoolean(x) {
	// return true if x is a string with value 'true' or 'false' (after trim() and toLowerCase() applied)
	if (!isString(x)) {
		return false;
	}
	x = x.trim().toLowerCase();
	return x === 'true' || x === 'false';
}

function isSymbol(x) {
	return typeof x === 'symbol';
}

function isUndefined(x) {
	return typeof x === 'undefined';
}

function isUUID(uuidString) {
	// a hack implementation but usable
	if (isEmpty(uuidString)) {
		return false;
	} else if (!isString(uuidString)) {
		return false;
	} else if (uuidString.length !== 36) {
		return false;
	} else if (uuidString.charAt(8) !== '-') {
		return false;
	} else if (uuidString.charAt(13) !== '-') {
		return false;
	} else if (uuidString.charAt(18) !== '-') {
		return false;
	} else if (uuidString.charAt(23) !== '-') {
		return false;
	} else {
		uuidString = replaceAll(uuidString.trim().toLowerCase(), '-', '');
		if (uuidString.length != 32) {
			return false;
		}
		if (!isHexString(uuidString)) {
			return false;
		}
	}
	return true;
}

// --------------------------------------------------------------------------------
// quickly toggle a boolean value represented in various ways (safe toggle to preserve type)
// --------------------------------------------------------------------------------
function toggleBoolean(x) {
	if (isEmpty(x)) {
		console.error('x is empty');
		return;
	} else if (isBoolean(x)) {
		return !x;
	} else if (isStringBoolean(x)) {
		return (x === 'false') ? 'true' : 'false';
	} else if (isNumberBoolean(x)) {
		return (x === 0) ? 1 : 0;
	} else {
		console.error('typeof x is unsupported');
	}
}

// -------------------------------------------------------------------------------------------
// GET safe string description of any variable (used for debug console output)
// -------------------------------------------------------------------------------------------
function getIndent(indentCount) {
	var indent = '';
	for (var count = 0; count < indentCount; count++) {
		indent += ' ';
	}
	return indent;
}

function getDescription(x, indentCount) {
	var indentCountMax = 8;

	if (isEmpty(indentCount)) {
		indentCount = 0;
	}

	if (isUndefined(x)) {
		return '{undefined}';
	} else if (isNull(x)) {
		return '{null}';
	} else if (isUUID(x)) {
		return '{UUID}' + x.toString();
	} else if (typeof x === 'string') {
		return '{string}' + x.toString();
	} else if (typeof x === 'number') {
		return '{number}' + x.toString();
	} else if (typeof x === 'boolean') {
		return '{boolean}' + x.toString();
	} else if (typeof x === 'symbol') {
		return '{symbol}' + x.toString();
	} else if (typeof x === 'function') {
		return '{function}' + x.toString();
	} else if (isDate(x)) {
		return '{date}' + x.toString();
	} else if (typeof x === 'object') {
		if (!isEmpty(x.length)) {
			var description = '{object,length=' + x.length + '}' + newlineChar;
			indentCount += 2;
			if (indentCount > indentCountMax) {
				description += getIndent(indentCount) + 'index[' + index + ']={more...;indentCount>indentCountMax}' + newlineChar;
			} else {
				for (var index = 0; index < x.length; index++) {
					description += getIndent(indentCount) + 'index[' + index + ']=' + getDescription(x[index], indentCount) + newlineChar;
				}
				return description.trim();
			}
		} else if (getPropertyCount(x) > 0) {
			var description = '{object,propertyCount=' + getPropertyCount(x) + '}' + newlineChar;
			indentCount += 2;
			if (indentCount > indentCountMax) {
				description += getIndent(indentCount) + 'index[' + index + ']={more...;indentCount>indentCountMax}' + newlineChar;
			} else {
				for (var property in x) {
					description += getIndent(indentCount) + 'property[' + property + ']=' + getDescription(x[property], indentCount) + newlineChar;
				}
				return description.trim();
			}
		}
		return '{object}' + x.toString();
	} else {
		var unknownType = typeof x;
		return '{unknown-type[' + unknownType + ']}' + x.toString();
	}
}

// -------------------------------------------------------------------------------------------
// test if an element is a jQuery element
// -------------------------------------------------------------------------------------------
function isJQueryElement(x) {
	if (isEmpty(x)) {
		return false;
	} else if (!isEmpty(x.jquery)) {
		return true;
	}
	return false;
}

// -------------------------------------------------------------------------------------------
// count the number of properties in an object
// -------------------------------------------------------------------------------------------
function getPropertyCount(x) {
	if (isEmpty(x)) {
		return 0;
	} else if (isPrimitive(x)) {
		return 0;
	}

	var count = 0;
	for (k in x) {
		count++;
	}

	return count;
}

// --------------------------------------------------------------------------------
// skips to next section of the profile when triggering profile filling mode for matching
//
function goToProfileStep(dest, mode, studentUid, signedStudentUid, stepDirection) { 
	var destPath;

	switch(dest) {
		case "matching_home":
		case "matching_home_from_photo":
			destPath = 'profile2?stay=1';
			if (dest == "matching_home_from_photo") {
				destPath += '&profile_photo=1';
			}
			break;
		case "profile_photo":
			destPath = 'ajax_profile?uid='+studentUid+'&embed=1&profile_photo=1';
			break;
		case "interests":
		case "interests_from_photo":
			destPath = 'student_interests_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			if (dest == "interests_from_photo") {
				destPath += '&profile_photo=1';
			}
			break;
		case "looking_for":
			destPath = 'student_looking_for_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "bio":
			destPath = 'student_bio_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "sports":
			destPath = 'student_sports_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "career_interests":
			destPath = 'student_industry_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "resume_education":
			destPath = 'student_academic_entry?ax=1&async=1&ajax_profile=1&visible=1';
			break;
		case "resume_work":
			destPath = 'student_work_entry?ax=1&async=1&ajax_profile=1&visible=1';
			break;
		case "languages":
			destPath = 'student_languages_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "social_links":
			destPath = 'student_social_links_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "twitter":
			destPath = 'student_twitter_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "linkedin":
			destPath = 'student_linkedin_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "facebook":
			destPath = 'student_facebook_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "instagram":
			destPath = 'student_instagram_entry?ax=1&async=1&uid='+studentUid+'&_s='+signedStudentUid;
			break;
		case "profile":
			destPath = 'profile?stay=1';
			break;
	}

	if (mode == "transitionModal") {
		destPath = destPath + '&fill_mode=popup';
		transitionModal(destPath, 'lg');
	}
	else if (mode == "openModal") {
		destPath = destPath + '&fill_mode=popup';
		openModal(destPath, 'lg');
	}
	else if (mode == "getContent") {
		if (dest != "profile") {
			destPath = destPath + '&fill_mode=fullscreen';
			window.scrollTo({ top: 0, behavior: 'smooth' });
			if (dest != "profile_photo") {
				$("#profile_header_photo").hide();
			}
			getContentWithCallback('profile_container', destPath, goToProfileStepCallBack(dest), []);
			
			if (stepDirection == "next") {
				$(".progress_step_active").first().next().addClass("progress_step_next_active");
				$(".progress_step_active").first().removeClass("progress_step_active");
				$(".progress_step_next_active").first().removeClass("progress_step_next_active").addClass("progress_step_active");
			}
			else if (stepDirection == "back") {
				$(".progress_step_active").first().prev().addClass("progress_step_next_active");
				$(".progress_step_active").first().removeClass("progress_step_active");
				$(".progress_step_next_active").first().removeClass("progress_step_next_active").addClass("progress_step_active");
				if (dest == "matching_home") {
					$("#progress_steps").hide();
				}
			}
		}
		else {
			window.location = destPath;
		}
	}
}

function goToProfileStepCallBack(dest) {
	if (dest == "profile_photo") {
		$("#profile_header_photo").show();
	}
} 

// --------------------------------------------------------------------------------
// skips to next onboarding step
//


function goToOnboardingStep(stepId, strCurrentStepId, strOnboardingId, studentUid, signedStudentUid, redirectURl) { 
	var destPath;

	if (strCurrentStepId != "" && stepId != "") {
		$("#slides").addClass("loading_step");
		$("#transition_loader").show();
	}

	if (stepId != "") {
		destPath = 'onboarding?stay=1&ax=1&async=1&step_id='+stepId+'&uid='+studentUid+'&_s='+signedStudentUid;
		if (strCurrentStepId != "") {
			saveSettings('onboarding_' + strOnboardingId, strCurrentStepId);
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });

		$.ajax({
			url: destPath,
			success: function (html) {
				$('#onboarding_wrapper').hide().html(html).fadeIn('slow');
				$("#slides").removeClass("loading_step");
				let state = { };
				let title = '';
				let myurl = '/' + destPath;
				//history.pushState(state, title, myurl);
			}
		});
	}
	else {
		$.ajax({
			url: "/settings_endpoint",
			data: 
			{ 
				name  : 'onboarding_' + strOnboardingId,
				value : 'complete',
				club  : ""
			},
			success: function () {
				window.location = redirectURl;
			}
		});
	}	
}

// --------------------------------------------------------------------------------
// selectize options and renderer
//

function getSelectizeRenderHTML(item, escape, wrapperId){
	var listItemAriaLabel = getAriaLabelForSelectizeStudents(wrapperId, escape(item.full_name), escape(item.email), escape(item.student_type), item.student_yog);
	var imageAltText = escape(item.full_name) + ' Profile Image';
	return '<div data-z="s04" aria-label="' + getSafeAriaLabelTextTrim(listItemAriaLabel) + '">' +
				'<img src="' + item.photo_url + '" alt="' + getSafeAriaLabelText(imageAltText) + '" aria-label="' + getSafeAriaLabelText(imageAltText) + '" />' +
				'<div style="display: inline-block; vertical-align: top; margin-left: 3px;">' +
					'<span style="font-weight: bold;">' + escape(item.full_name) + '</span>' +
					'<span> - ' + escape(item.email) + '</span>' +
					'<br />' +
					'<span>' + item.student_type + item.student_yog + '</span>' +
				'</div>' +
			'</div>';
}

function initSelectize(repoId, wrapperId, inputId, isSelectizeInputRequired, customUpdate){

	$("#" + repoId).selectize({
		valueField: 'id',
		labelField: 'full_name',
		searchField: 'search_field',
		create: false,
		plugins: ['remove_button'],
		render: {
			option: function(item, escape){
				return getSelectizeRenderHTML(item, escape, wrapperId)
			}
		},
		load: function (query, callback) {
			if (!query.length) return callback();
			$.ajax({
				dataType: "json",
				url: '/mobile_ws/v18/mobile_student_select?search=' + encodeURIComponent(query) ,
				type: 'GET',
				error: function () {
					callback();
				},
				success: function (res) {
					var inputLabelText = 'Lookup users by name or email';
					var resultList = res.students.slice(0, 10);
					clearSelectizeResults(wrapperId);
					setSelectizeResultLength(wrapperId, resultList.length)
					callback(resultList);
					setAriaLabelForSelectizeDelayed(100, wrapperId, inputLabelText, true);
				}
			});
		},
		onDelete: function (values) {
			return true;
		}
	});

	var new_student_id = ""
	var $wrapper = $("#" + wrapperId);
	$('select.selectized,input.selectized', $wrapper).each(function () {
		var $input = $(this);
		 var update = function (e) {
			if ($input.val() !== null) {
				new_student_id = $input.val().toString();
				if (customUpdate != undefined) customUpdate(new_student_id);
				else $('#' + inputId).val(new_student_id);
			}
		}
		$(this).on('change', update);
		update();
	});
	
	var selectizeInputAriaLabel = 'Lookup users by name or email. Select users.';
	setupSelectizeInput(wrapperId, selectizeInputAriaLabel, isSelectizeInputRequired ? true : false);

	var $select = $(document.getElementById(repoId)).selectize();
	var selectize = $select[0].selectize;
	return selectize;
}
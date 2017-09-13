/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

//  Andy Langton's show/hide/mini-accordion @ http://andylangton.co.uk/jquery-show-hide

// this tells jquery to run the function below once the DOM is ready
$(document).ready(function() {

    // choose text for the show/hide link - can contain HTML (e.g. an image)
    var showText = 'Show';
    var hideText = 'Hide';

    // initialise the visibility check
    var is_visible = false;

    // append show/hide links to the element directly preceding the element with a class of "toggle"
    $('.toggle').prev().append(' <a href="#" class="toggleLink">' + hideText + '</a>');

    // hide all of the elements with a class of 'toggle'
    $('.toggle').show();

    // capture clicks on the toggle links
    $('a.toggleLink').click(function() {

        // switch visibility
        is_visible = !is_visible;

        // change the link text depending on whether the element is shown or hidden
        if ($(this).text() == showText) {
            $(this).text(hideText);
            $(this).parent().next('.toggle').slideDown('slow');
        } else {
            $(this).text(showText);
            $(this).parent().next('.toggle').slideUp('slow');
        }

        // return false so any link destination is not followed
        return false;

    });
});

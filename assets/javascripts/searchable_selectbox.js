// Replace with select2 when the HTTP status of ajax request is a success.
// (by pure jquery)
$(document).ajaxSuccess(function () {
  replaceSelect2()
});
// Replace with select2 when the HTTP status of data-remote request is a success.
// (by rails-ujs)
$(document).on('ajax:success', function () {
  replaceSelect2()
});

$(function () {
  // Replace with select2 when loading page.
  replaceSelect2();

  // Fix Select2 search broken inside jQuery UI modal Dialog( https://github.com/select2/select2/issues/1246 )
  if ($.ui && $.ui.dialog && $.ui.dialog.prototype._allowInteraction) {
    let ui_dialog_interaction = $.ui.dialog.prototype._allowInteraction;
    $.ui.dialog.prototype._allowInteraction = function (e) {
      if ($(e.target).closest('.select2-dropdown').length) {
        return true;
      }
      return ui_dialog_interaction.apply(this, arguments);
    };
  }

  // Supports change of select box by filter function
  if ($('#query_form_with_buttons').length || $('form#query-form').length || $('form#query_form').length) {
    let oldAddFilter = window.addFilter;
    window.addFilter = function (field, operator, values) {
      oldAddFilter(field, operator, values);
      callSelect2($('#filters-table select:not([multiple]):not(.select2-hidden-accessible)'));
      $('#select2-add_filter_select-container.select2-selection__rendered').text('');
    }

    let oldToggleMultiSelect = window.toggleMultiSelect;
    window.toggleMultiSelect = function (el) {
      oldToggleMultiSelect(el);
      if (el.attr('multiple')) {
        el.select2('destroy');
      } else {
        callSelect2(el);
      }
    }
  }
});

function replaceSelect2()
{
  // TODO: Need to support replace of select according to the click event.
  // Do not replace it with select2 until it corresponds.
  if ($('body').hasClass('controller-workflows')) {
    return;
  }

  let selectInTabular = $('.tabular select:not([multiple]):not(.select2-hidden-accessible)');
  if (selectInTabular.length) {
    callSelect2(selectInTabular, {width: '85%'});
  }

  let other = $('select:not([multiple]):not(.select2-hidden-accessible)');
  if (other.length) {
    callSelect2(other);
  }
}

function callSelect2($collections, options = {})
{
  const usersSelectId = new Set([
    'issue_assigned_to_id',
    'values_assigned_to_id_1',
    'values_author_id_1'
  ]);

  let noSearchOpts = Object.create(options);
  noSearchOpts["minimumResultsForSearch"] = Infinity;

  $collections.each(function (index, dom) {
    let baseOptions = (dom.options.length < 10) ? noSearchOpts : options;

    if (usersSelectId.has(dom.id)) {
      callSelect2ForUsers(dom, baseOptions);
    } else {
      $(dom).select2(baseOptions);
    }
  });
}

function callSelect2ForUsers(dom, baseOptions)
{
  let groupingOptions = {};

  for (let i = 0; i < dom.options.length; ++i) {
    let option = dom.options[i];
    let result = /【(.+)】/.exec(option.text);
    let category = (result) ? result[1] : '';

    if (groupingOptions[category]) {
      groupingOptions[category].push(option);
    } else {
      groupingOptions[category] = [option];
    }
  }

  let select2Data = [];
  for (let groupingOptionsKey in groupingOptions) {
    let options = groupingOptions[groupingOptionsKey];
    let children = [];

    for (let i = 0; i < options.length; ++i) {
      let option = options[i];
      children.push({
        'id': option.value,
        'text': option.text,
        'selected': option.selected
      });
    }

    if (!groupingOptionsKey) {
      select2Data = select2Data.concat(children);
    } else {
      select2Data.push({
        'text': groupingOptionsKey,
        'children': children
      });
    }
  }

  let o = Object.create(baseOptions);
  o['data'] = select2Data;
  if (!o['width']) {
    o['dropdownAutoWidth'] = true;
  }

  $(dom).empty().select2(o);
}

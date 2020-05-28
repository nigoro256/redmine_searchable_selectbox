require 'redmine'
require 'searchable_selectbox/hook_listener'

Redmine::Plugin.register :redmine_searchable_selectbox do
  name 'Redmine Searchable Selectbox'
  description "This plugin changes Redmine's selectbox searchable. (Customized https://github.com/ishikawa999/redmine_searchable_selectbox)"
  url 'https://github.com/nigoro256/redmine_searchable_selectbox'
  author 'nigoro256'
  version '1.0.0'
end

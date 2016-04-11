// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', ['ng-admin']);
// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('My First Admin').baseApiUrl('http://jsonplaceholder.typicode.com/');
    // more configuration here later
    // ...
    var user = nga.entity('users');
    // set the fields of the user entity list view
    user.listView().fields([
        nga.field('name'),
        nga.field('username'),
        nga.field('email')
    ]);

    user.creationView().fields([
	    nga.field('name')
	        .validation({ required: true, minlength: 3, maxlength: 100 }),
	    nga.field('username')
	        .attributes({ placeholder: 'No space allowed, 5 chars min' })
	        .validation({ required: true, pattern: '[A-Za-z0-9\.\-_]{5,20}' }),
	    nga.field('email', 'email')
	        .validation({ required: true }),
	    nga.field('address.street')
	        .label('Street'),
	    nga.field('address.city')
	        .label('City'),
	    nga.field('address.zipcode')
	        .label('Zipcode')
	        .validation({ pattern: '[A-Z\-0-9]{5,10}' }),
	    nga.field('phone'),
	    nga.field('website')
	        .validation({ validator: function(value) {
	            if (value.indexOf('http://') !== 0) throw new Error ('Invalid url in website');
	        } })
	]);
	
    // use the same fields for the editionView as for the creationView
	user.editionView().fields(user.creationView().fields());

    // add the user entity to the admin application
    admin.addEntity(user);

    var post = nga.entity('posts');
    post.listView()
    .fields([
        nga.field('id'),
        nga.field('title'),
        nga.field('userId', 'reference')
            .targetEntity(user)
            .targetField(nga.field('username'))
            .label('User')
    ]).filters([
        nga.field('q')
            .label('Full-Text')
            .pinned(true),
        nga.field('userId', 'reference')
            .targetEntity(user)
            .targetField(nga.field('username'))
            .label('User')
    ]);    

    post.showView().fields([
	    nga.field('title'),
	    nga.field('body', 'text'),
	    nga.field('userId', 'reference')
	        .targetEntity(user)
	        .targetField(nga.field('username'))
	        .label('User'),
	    nga.field('comments', 'referenced_list')
	        .targetEntity(nga.entity('comments'))
	        .targetReferenceField('postId')
	        .targetFields([
	            nga.field('email'),
	            nga.field('name')
	        ])
	        .sortField('id')
	        .sortDir('DESC'),
	]);
	admin.addEntity(post);
    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);

myApp.config(['RestangularProvider', function (RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }
        return { params: params };
    });
}]);
angular.module('myApp.ckEditorService', [])
    .service('ckEditorService', function(apiUrl, $http, $state, $rootScope) {
        this.showEditor = function() {
            CKEDITOR.replace('ckeditor', {
                width: '100%',
                height: 350,
                allowedContent: true,
                // Define the toolbar groups as it is a more accessible solution.
                toolbarGroups: [{
                        name: 'document',
                        groups: ['mode', 'document', 'doctools']
                    }, {
                        name: 'clipboard',
                        groups: ['clipboard', 'undo']
                    }, {
                        name: 'editing',
                        groups: ['find', 'selection', 'spellchecker']
                    }, {
                        name: 'forms'
                    },
                    '/', {
                        name: 'basicstyles',
                        groups: ['basicstyles', 'cleanup']
                    }, {
                        name: 'paragraph',
                        groups: ['list', 'indent', 'blocks', 'align', 'bidi']
                    }, {
                        name: 'links'
                    }, {
                        name: 'insert'
                    },
                    '/', {
                        name: 'styles'
                    }, {
                        name: 'colors'
                    }, {
                        name: 'tools'
                    }, {
                        name: 'others'
                    }, {
                        name: 'about'
                    }
                ],
                // Remove the redundant buttons from toolbar groups defined above.
                removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
            });
        };
    });
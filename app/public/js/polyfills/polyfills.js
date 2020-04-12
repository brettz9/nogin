// We don't put these in the files, as we want those files to
//  work in the browser (we could target `node_modules`, but more ugly
//  and shouldn't be needed by modern ESM-supporting browsers anyways)

// app/public/js/controllers/homeController.js
import 'core-js/stable/promise/index.js';

// app/public/js/form-validators/AccountValidator.js
import 'core-js/modules/es.object.values.js';

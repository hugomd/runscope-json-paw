var Mustache = require("./mustache.js");

addslashes = function(str) {
    return ("" + str).replace(/[\\"]/g, '\\$&');
};

var RunscopeJSONGenerator = function() {
        var client_code = "";

        this.headers = function(request) {
            var header_name, header_value, headers;
            headers = request.headers;

            return {
                "has_headers": Object.keys(headers).length > 0,
                "header_list": (function() {
                    var results = [];
                    for (header_name in headers) {
                        header_value = headers[header_name];
                        results.push({
                            "header_name": addslashes(header_name),
                            "header_value": addslashes(header_value)
                        });
                    }
                    return results;
                })()
            };
        };

        this.body = function(request) {
          var has_tabs_or_new_lines, multipart_body, name, raw_body, url_encoded_body, value;
          url_encoded_body = request.urlEncodedBody;
          if (url_encoded_body) {
            return {
              "has_url_encoded_body": true,
              "url_encoded_body": (function() {
                var results;
                results = [];
                for (name in url_encoded_body) {
                  value = url_encoded_body[name];
                  results.push({
                    "name": addslashes(name),
                    "value": addslashes(value)
                  });
                }
                return results;
              })()
            };
          }
          multipart_body = request.multipartBody;
          if (multipart_body) {
            return {
              "has_multipart_body": true,
              "multipart_body": (function() {
                var results;
                results = [];
                for (name in multipart_body) {
                  value = multipart_body[name];
                  results.push({
                    "name": addslashes(name),
                    "value": addslashes(value)
                  });
                }
                return results;
              })()
            };
          }
          raw_body = request.body;
          if (raw_body) {
            if (raw_body.length < 5000) {
              has_tabs_or_new_lines = null !== /\r|\n|\t/.exec(raw_body);
              return {
                "has_raw_body_with_tabs_or_new_lines": has_tabs_or_new_lines,
                "has_raw_body_without_tabs_or_new_lines": !has_tabs_or_new_lines,
                "raw_body": has_tabs_or_new_lines ? addslashes_single_quotes(raw_body) : addslashes(raw_body)
              };
            } else {
              return {
                "has_long_body": true
              };
            }
          }
        };
        
        this.strip_last_backslash = function(string) {
            var i, j, lines, ref;
            lines = string.split("\n");
            for (i = j = ref = lines.length - 1; ref <= 0 ? j <= 0 : j >= 0; i = ref <= 0 ? ++j : --j) {
                lines[i] = lines[i].replace(/\s*\\\s*$/, "");
                if (!lines[i].match(/^\s*$/)) {
                    break;
                }
            }
            return lines.join("\n");
        };
        this.generate = function(context, requests, options) {
            var rendered_code, request, template, view;
            request = context.getCurrentRequest();
            view = {
                "request": context.getCurrentRequest(),
                "headers": this.headers(request),
                "body": this.body(request)
            };
            template = readFile("json-template.mustache");
            rendered_code = Mustache.render(template, view);
            return this.strip_last_backslash(rendered_code);
        };
}

RunscopeJSONGenerator.identifier = "com.localz.PawExtensions.RunscopeJSONGenerator";
RunscopeJSONGenerator.title = "Runscope JSON Generator";
RunscopeJSONGenerator.fileExtension = "json";
RunscopeJSONGenerator.languageHighlighter = "json";

registerCodeGenerator(RunscopeJSONGenerator);

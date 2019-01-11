import os
from flask import Flask, flash, redirect, render_template, request, session, abort, make_response, url_for

app = Flask(__name__)

# appened static content with version number to overcome caching
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)

@app.route('/')
def index():
    return 'hi there'

@app.route('/data-tools/creative-industries-funding-map')
def index_with_path():
    return render_template('index.html', map_data = {4: 6})

if __name__ == '__main__':
    app.run(debug=True)
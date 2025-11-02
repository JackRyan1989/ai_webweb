const webSearchSchema = {
        'type': 'array',
        "items": {
            "type": "object",
            "properties": {
                'position': {
                    'type': 'number',
                },
                'title':  {
                    "type": "string",
                },
                "link": {
                    "type": "string",
                },
            },
            'required': ["position", "title", "link"]
        }
    }

export default webSearchSchema;

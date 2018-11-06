//
//	Extract and format the API in a way that is well organized
//
let ExportApiToMarkdown = function()
{
	function warpJSONCode(code) {
		return `
		\n\`\`\`JSON
		${code}
		\n\`\`\`
		`
	}
	function responseSectionFromExhange(responseExchange) {
		let headers = responseExchange.responseHeaders;
		let body = responseExchange.responseBody;
		let str = `### Response
		\n####Header
		${warpJSONCode(JSON.stringify(headers))}
		\n####Body
		${warpJSONCode(body)}
		`
		return str
	}

	this.generate = function(context, requests, options)
	{
		//
		//	1.	Create an empty string that which will hold the formated TXT
		//		file
		//
		let md_file = "";

		//
		//	2.	Loop over each endpoint and extract, and format the data
		//		the way we like it.
		//
		for (let key in requests)
		{
			//
			//	1.	Create a clear readable that holds the endpoint
			//
			let endpoint = requests[key];

			//
			//	2.	Create a empty array that will hold the data for
			//		one section endpoint
			//
			let section = [];

			//
			//	3.	Get the name of the endpoint
			//
			section.push('## ' + endpoint.name);

			section.push('\n\n');

			//
			//	4.	Get the endpoint path of the endpoint with the method
			//
			section.push('**Endpoint**: ' + endpoint.method + ' - ' + endpoint.url);

			section.push('\n\n');

			//
			//	5.	Get the description and defaults to N/A if nothing was
			//		set by the user
			//
			let description = endpoint.description || "N/A";

			//
			//	6.	Save the description
			//
			section.push("**Description**: " + description);

			section.push('\n\n');

			//
			//	7.	Check if there are headers set in the endpoint
			//
			if(endpoint.headers)
			{
				//
				//	1.	Create the section
				//
				section.push("#### Header");
				section.push('\n');

				section.push("```");
				section.push('\n');

				//
				//	2.	Format the header
				//
				section.push(parse_paw_data(endpoint.headers));
				section.push('\n');

				section.push("```");
				section.push('\n');
			}

			section.push('\n\n');

			//
			//	8.	Create the section
			//
			section.push("#### Body");

			section.push('\n');

			section.push("```");
			section.push('\n');

			//
			//	9.	Check if we are dealing with ha body that is JSON
			//
			if(endpoint.jsonBody)
			{
				section.push(JSON.stringify(endpoint.jsonBody, null, "\t"));
			}

			//
			//	10.	Check if we are dealing with a clear txt body and make
			//		suer to go through this check only if the jsonBody is not
			//		present, since Paw will populate the .body letiable
			//		even if we have .jsonBody
			//
			if(endpoint.body && !endpoint.jsonBody)
			{
				section.push(endpoint.body);
			}

			//
			//	11. check to see if we are dealing with a form body
			//
			if(endpoint.urlEncodedBody)
			{
				section.push(parse_paw_data(endpoint.urlEncodedBody));
			}

			//
			//	12. Check if we are dealing with binary data like uploading
			//		a file.
			//
			if(endpoint.multipartBody)
			{
				section.push(parse_paw_data(endpoint.multipartBody));
			}

			section.push('\n');
			section.push("```");

			// 13. Generate Sample Response If exist
			section.push('\n\n');
			let responseExchange = context.getCurrentRequest().getLastExchange();
			if (responseExchange) {
				section.push(responseSectionFromExhange(responseExchange));
			}
			//
			//	Convert the array with all the data in to a single string
			//	which will become out .md file.
			//
			md_file += section.join("");
		}

		//
		//	->	Return the .md file to Paw
		//
		return md_file;
	}
}

//
//	Set some mandatory basic information about the extension
//
ExportApiToMarkdown.identifier = "com.0x4447.ExportApiToMarkdown";
ExportApiToMarkdown.title = "Export API to Markdown";
ExportApiToMarkdown.fileExtension = "md";
ExportApiToMarkdown.languageHighlighter = "markdown";

//
//	Expose the function to Paw
//
registerCodeGenerator(ExportApiToMarkdown);

//  _    _   ______   _        _____    ______   _____     _____
// | |  | | |  ____| | |      |  __ \  |  ____| |  __ \   / ____|
// | |__| | | |__    | |      | |__) | | |__    | |__) | | (___
// |  __  | |  __|   | |      |  ___/  |  __|   |  _  /   \___ \
// | |  | | | |____  | |____  | |      | |____  | | \ \   ____) |
// |_|  |_| |______| |______| |_|      |______| |_|  \_\ |_____/
//

//
//	Format Paw data
//
function parse_paw_data(data)
{
	let tmp = [];

	tmp.push('{');
	tmp.push('\n');

	for(let key in data)
	{
		tmp.push('\t' + key + ': ' + data[key]);
		tmp.push('\n');
	}

	tmp.push('}');

	return tmp.join("");
}
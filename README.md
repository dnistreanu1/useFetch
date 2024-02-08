
Hi, you're welcome to try out this very minimalistic fetch library.
<br>
It exposes 2 hooks: `useReader` and `useWriter`. It's supposed to prevent users from accidentally overwriting an API resource.
### **TLDR**:
`useReader` - can only be used with the **GET** HTTP method. Don't have a request body.
<br>
`useWriter` - can be used with any HTTP method except **GET**. It has a request body,

# How to use `useReader` hook:
  ## It has the following _props_:
`url: string;`
> Request url. A change of this prop does trigger an API request.

`isSuspended?: boolean;`
> When `isSuspended` is equal to true, the API request will not be executed. When _isSuspended_ is equal to false or undefined, the API request will be executed.
A change in this prop does trigger the API request.

`initialValue?: TResponseData | null;` 
> It's a placeholder for the response body. Useful when mocking data or when needing to show a placeholder while waiting for API response. A change in this prop doesn't trigger an API request.

`deps?: Array<unknown>;` 
> It's the dependency array for the API request. A change in this prop does trigger the API request.

`options?.headers?: [keyof HTTPHeader, string][];` 
> The HTTP headers of the API request. A change in this prop doesn't trigger the API request.

`options?.fetchOptions?: Partial<Omit<RequestInit, "body">>;` 
> The rest of the props of the native `options` object from the JavaScript `fetch` function. Excluding `body`. A change in this prop doesn't trigger the API request. 

`options?.logger: (obj: any) => void;` 
> The custom logging function is passed to the library to log the API request result. A change in this prop doesn't trigger the API request.

### It has the following _return_ type: 
`data: TResponseData | null;` 
> _data_ is the response body. The initial value is `null`.

`isLoading: boolean;` 
> This flag is set to `true` while the API Request promise isn't resolved. Once it is resolved the flag value becomes `false`.

`error: HTTPStatusCode | null;` 
> This property contains the error status code if the API Request fails.

`readData: (newUrl?: string) => Promise<void>;`
> This is the function which makes the network request. It can be used to trigger API requests conditionally without using built-in props.

# How to use `useWriter` hook: 
// TODO

type IOptions = {
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  sortBy?: string;
};


type IOptionsResult ={
    page:number;
    limit:number;
    skip:number;
    sortBy:string;
    sortOrder:string
}
const paginationSortingHelper = (options: IOptions) => {
    const page = Number(options.page)|| 1;
    const limit = Number(options.limit) || 10;
    const skip  = (page-1)* limit
    const sortBy:string = options.sortBy || "createdAt" ;
    const sortOrder:string = options.sortOrder || "desc"
  console.log(options);
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  }
};
export default paginationSortingHelper;

INSERT INTO public.scrape_jobs (id,"retailer",status,"itemsScraped","itemsUpdated","itemsFailed","error","startedAt","completedAt") VALUES
	 ('cmgw7iz5800008tj78lbx3lb0','DATABLITZ'::public."Retailer",'failed',0,0,0,'
Invalid `prisma.scrapingState.findUnique()` invocation in
/Users/rgacorda/Desktop/PCscraper/src/scraper/index.ts:52:42

  49  * Get pagination state for a retailer/category combo
  50  */
  51 async function getScrapingState(retailer: Retailer, category: string = '''') {
→ 52   let state = await prisma.scrapingState.findUnique(
The table `public.scraping_state` does not exist in the current database.','2025-10-18 11:41:27.789','2025-10-18 11:41:27.8'),
	 ('cmgw7iz5p00018tj7smu38gil','PCWORTH'::public."Retailer",'failed',0,0,0,'
Invalid `prisma.scrapingState.findUnique()` invocation in
/Users/rgacorda/Desktop/PCscraper/src/scraper/index.ts:52:42

  49  * Get pagination state for a retailer/category combo
  50  */
  51 async function getScrapingState(retailer: Retailer, category: string = '''') {
→ 52   let state = await prisma.scrapingState.findUnique(
The table `public.scraping_state` does not exist in the current database.','2025-10-18 11:41:27.806','2025-10-18 11:41:27.808'),
	 ('cmgw7iz5u00028tj75sx0r729','BERMOR'::public."Retailer",'failed',0,0,0,'
Invalid `prisma.scrapingState.findUnique()` invocation in
/Users/rgacorda/Desktop/PCscraper/src/scraper/index.ts:52:42

  49  * Get pagination state for a retailer/category combo
  50  */
  51 async function getScrapingState(retailer: Retailer, category: string = '''') {
→ 52   let state = await prisma.scrapingState.findUnique(
The table `public.scraping_state` does not exist in the current database.','2025-10-18 11:41:27.81','2025-10-18 11:41:27.812'),
	 ('cmgw7jeu30000j32xl6usm3kd','DATABLITZ'::public."Retailer",'completed',2440,2440,0,NULL,'2025-10-18 11:41:48.123','2025-10-18 11:42:12.744'),
	 ('cmgw7jxu305nfj32xvb2nd0l8','PCWORTH'::public."Retailer",'running',0,0,0,NULL,'2025-10-18 11:42:12.747',NULL),
	 ('cmgw7mcz70000ld5so6rgdo6d','DATABLITZ'::public."Retailer",'completed',2440,2440,0,NULL,'2025-10-18 11:44:05.683','2025-10-18 11:44:24.145'),
	 ('cmgw7mr8303rnld5s9cvdtosd','PCWORTH'::public."Retailer",'completed',1670,1670,0,NULL,'2025-10-18 11:44:24.148','2025-10-18 11:47:27.094'),
	 ('cmgw7qodz07njld5sgpoocf39','BERMOR'::public."Retailer",'completed',8660,8660,0,NULL,'2025-10-18 11:47:27.096','2025-10-18 12:07:57.63');

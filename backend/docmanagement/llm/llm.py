from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceHubEmbeddings

from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from langchain import hub
from langchain_community.document_loaders import PyPDFLoader, BSHTMLLoader
from langchain_core.runnables import RunnableParallel


from langchain.text_splitter import CharacterTextSplitter
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate

import os
import json

import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

load_dotenv()


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def split2texts(file_path, text_splitter, remote=False, user="hasan", doc_name=""):

    if remote:
        pass

    file_name, file_type = str(file_path).split("/")[-1].split(".")

    # name document with file name as default
    if doc_name == "":
        doc_name = file_name

    # use an appropriate file loader based on type
    if file_type.strip() == "pdf":
        loader = PyPDFLoader(file_path, extract_images=True)

    elif file_type.strip() in ["htm", "html", "mhtml"]:
        loader = BSHTMLLoader(file_path)

    # read the file and split into documents
    pages = loader.load_and_split()

    texts = text_splitter.split_documents(pages)

    for text in texts:
        text.metadata["docname"] = doc_name
        text.metadata["docsourcetype"] = "html"
        text.metadata["doctype"] = "text"
        text.metadata["user"] = user
        text.metadata["folder"] = "common"
        text.metadata["organization"] = "default"

    return texts


def invoke_chain(chain, question):
    response = chain.invoke(question)
    return response


def get_rag_chain(retriever, llm, k=2, return_resource=False):

    prompt = hub.pull("rlm/rag-prompt")

    if not return_resource:
        rag_chain = (
            {
                "context": retriever | format_docs,
                "question": RunnablePassthrough(),
            }
            | prompt
            | llm
            | StrOutputParser()
        )

    else:
        rag_chain_conf = (
            RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
            | prompt
            | llm
            | StrOutputParser()
        )

        rag_chain = RunnableParallel(
            {"context": retriever, "question": RunnablePassthrough()}
        ).assign(answer=rag_chain_conf)

    return rag_chain


def get_es_store(
    cloudid,
    api_key,
    index_name="search-investai",
    embedding=HuggingFaceHubEmbeddings(),
    distance_strategy="DOT_PRODUCT",
):

    elastic_vector_search = ElasticsearchStore(
        es_cloud_id=cloudid,
        index_name=index_name,
        embedding=embedding,
        es_api_key=api_key,
        distance_strategy=distance_strategy,
    )

    return elastic_vector_search


def invoke_summary_chain(docs, llm, method="dense_summary", model_name="gpt-3.5-turbo"):

    if method == "dense_summary":
        prompt = hub.pull("lawwu/chain_of_density")
        chain = (
            prompt
            | llm
            | StrOutputParser()
            | json.loads
            | (lambda x: x[-1]["Denser_Summary"])
        )

        content = format_docs(docs)
        result = chain.invoke({"ARTICLE": content})

    return result


# use llm models having large token limits such as model_name="gpt-3.5-turbo-0125"
def summary_chain(docs, llm):

    # prompt
    template_str = """The following is a set of documents \n\n
    {docs}
    Based on this list of docs, firstly please identify the main themes.
    Secondly, summarize each theme based on the docs provided with relevant information included but not limited to:
    insight about the theme, main entities mentioned, quantification and numbers etc. Your summaries for each theme
    can be between 300 to 600 words in length. Whole summary can be up to 4000 words.
    Do not speculate or overuse same information. Try to cover as much significant information and insight as possible.
    DO NOT USE "document" word or wordings attributing to the document like "document highlights", "in the document it's mentioned that", "document discussess" etc.
    Write summarize like directly you have authored the article and docs.  
    Return a python dictionary in your response, each key is a theme you extracted and value is the summary of that theme from the documents.
    \n\n
    Output:"""

    prompt_template = PromptTemplate.from_template(template_str)
    llm_chain = LLMChain(llm=llm, prompt=prompt_template)

    return llm_chain.run(docs=docs)


# SEC FILE SCRAPING

import requests
import os


def format_url(cik, accn):
    base_url = "https://www.sec.gov/Archives/edgar/data"
    return f"{base_url}/{cik}/{accn}-index.html"


def format_excel_url(cik, accn):
    base_url = "https://www.sec.gov/Archives/edgar/data"
    accn = str(accn).replace("-", "").replace("_", "")
    return f"{base_url}/{cik}/{accn}/Financial_Report.xlsx"


def download_file(url, local_directory):

    # Get the filename from the URL and append the random prefix
    filename = os.path.basename(url)

    file_type = str(filename).split(".")[-1].strip()
    if file_type in ["xls", "xlsx"]:
        filing_id = str(url).split("/")[-2].strip()
        local_filename = os.path.join(local_directory, f"{filing_id}-{filename}")
    else:
        local_filename = os.path.join(local_directory, f"{filename}")
    # local_filename = os.path.join(local_directory, f"{random_prefix}_{filename}")

    try:
        # Download the file using urllib
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers)
        with open(local_filename, "wb") as output_file:
            output_file.write(response.content)

        print(f"File downloaded successfully to {local_filename}")
    except Exception as e:
        print(f"Failed to download file. Error: {e}")

    return local_filename

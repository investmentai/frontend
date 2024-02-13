from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from docmanagement.models import UserDocument
from django.contrib.auth.models import User
from .models import UserApiKey, UserFolder, UserDocument, UserReport, ReportSection
from .serializers import UserReportSerializer, ReportVersionSerializer


class TestView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({"message": "successfully connected"}, status=200)


# UPLOAD DOCUMENTS
from docmanagement.llm.llm import *
import os
from dotenv import load_dotenv

load_dotenv()


# uplaod multiple documents to a folder and index them to vector database
class UploadDocumentView(APIView):

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            print("Document upload started")
            folder_id = 1  # request.data.get("folder_id")
            print("Folder id", folder_id)
            files = request.FILES.getlist("files")
            print("Files received", len(files))

            for file in files:
                document_name = file.name
                file_type = file.name.split(".")[-1]
                if file_type not in ["pdf", "doc", "docx"]:
                    return Response(
                        {"error": "Invalid file type"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Create a Document object
                document = UserDocument.objects.create(
                    user=user,
                    folder_id=folder_id,
                    document_name=document_name,
                    document=file,
                )

                # Get relative file_path from the saved file
                file_path = document.document.url
                # remove the leading slash
                if file_path.startswith("/"):
                    file_path = file_path[1:]

                print("Document saved", file_path)
                print(os.listdir())
                # Get absolute file_path from the saved file
                # file_path = document.document.path

                # Index document here
                # TODO

                cloudid = os.environ["ELASTICSEARCH_CLOUDID"]
                es_api_key = os.environ["ELASTICSEARCH_API_KEY"]

                embedding = HuggingFaceHubEmbeddings()
                text_splitter = CharacterTextSplitter(chunk_size=1800, chunk_overlap=0)
                texts = split2texts(file_path, text_splitter)
                print("text size", len(texts))

                es = get_es_store(cloudid, es_api_key, embedding=embedding)
                indices = es.add_documents(texts)
                print("embedded texts")

            return Response(
                {"success": "Files uploaded and indexed successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print("Document upload error", e)
            return Response(
                {"error": f"Failed to upload and index files: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


from django.core.files import File


# uplaod multiple documents to a folder and index them to vector database
class RetrieveSecView(APIView):

    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            print("Document upload started")
            folder_id = 2  # request.data.get("folder_id")
            print("Folder id", folder_id)
            url = request.data.get("url")
            print("url received", url)

            # url = format_url("1318605", "0001628280-24-002390")
            # url = format_excel_url("1318605", "0001628280-24-002390")
            local_directory = "./"
            file_path = download_file(url, local_directory)
            document_name = file_path.split("/")[-1].split(".")[0]
            # Open the downloaded file and create a File object
            with open(file_path, "rb") as file:
                django_file = File(file)

                # Create a UserDocument object
                document = UserDocument.objects.create(
                    user=user,
                    folder_id=folder_id,
                    document_name=document_name,
                    document=django_file,
                )
            print("Saved the remote document", document.document.url)
            # Clean up: Remove the locally downloaded file after saving it to the UserDocument
            os.remove(file_path)

            # Get relative file_path from the saved file
            file_path = document.document.url
            # remove the leading slash
            if file_path.startswith("/"):
                file_path = file_path[1:]

            cloudid = os.environ["ELASTICSEARCH_CLOUDID"]
            es_api_key = os.environ["ELASTICSEARCH_API_KEY"]

            embedding = HuggingFaceHubEmbeddings()
            text_splitter = CharacterTextSplitter(chunk_size=1800, chunk_overlap=0)
            texts = split2texts(file_path, text_splitter)
            print("text size", len(texts))

            es = get_es_store(cloudid, es_api_key, embedding=embedding)
            indices = es.add_documents(texts)
            print("embedded texts")

            return Response(
                {"message": "Files uploaded and indexed successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print("Document upload error", e)
            return Response(
                {"error": f"Failed to upload and index files: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class IndexDocumentView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            folder_id = request.data.get("folder_id")
            document_id = request.data.get("document_id")
            file_path = request.data.get("file_path")
            file_path = "media/" + file_path
            # absolute_file_path = os.path.abspath(file_path)
            # print("Absolute file path:", absolute_file_path)

            print("Started indexing...")

            # index document here

            return Response(
                {"success": "File indexed successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print(f"Failed to index file: {e}")
            return Response(
                {"error": f"Failed to index file: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# this view handles the document prompt, retrieval and chat with user and LLM
class ChatPromptView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            prompt = request.data.get("prompt")
            # folder_id = request.data.get("folder_id")
            # document_id = request.data.get("document_id")
            api_key = UserApiKey.objects.get(user=user).api_key

            print("Chat started...")
            print("Prompt: ", prompt)
            # print("Folder id: ", folder_id)
            """
                Call LLM: Initializes the agent and calls the LLM API
                Returns the response from the LLM API as dict
                    dict keys: message, tokens, total_cost
                    tokens: Total number of tokens used and cost incurred 
                        dict keys: total_tokens, prompt_tokens, completion_tokens 
            """
            # invoke llm chain
            # TODO
            message = f"AI:   \n {prompt}"

            cloudid = os.environ["ELASTICSEARCH_CLOUDID"]
            es_api_key = os.environ["ELASTICSEARCH_API_KEY"]

            embedding = HuggingFaceHubEmbeddings()
            es = get_es_store(cloudid, es_api_key, embedding=embedding)

            filter = {"term": {"metadata.user": "hasan"}}

            retriever = es.as_retriever(search_kwargs={"k": 20, "filter": filter})

            llm = ChatOpenAI(
                openai_api_key=api_key,
                model_name="gpt-4-turbo-preview",
                temperature=0,
            )

            rag_chain = get_rag_chain(retriever, llm)
            message = invoke_chain(rag_chain, prompt)
            message = "AI: " + message

            return Response(
                {"message": message},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print("Chat error", e)
            return Response(
                {"error": f"Failed to continue chat: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


################### DOCUMENT and FOLDER RELATED VIEWS ###################


# list user folders - container of documents like a parent topic
class FolderListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # user = request.user
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            # sort folders by name
            folders = (
                UserFolder.objects.filter(user=user, active=True)
                .order_by("folder_name")
                .values("id", "folder_name")
            )

            folder_list = []
            for folder in folders:
                folder_list.append({"id": folder["id"], "name": folder["folder_name"]})

            print("folders", folder_list)
            return Response({"folders": folder_list}, status=status.HTTP_200_OK)

        except Exception as e:
            print("LLM folder error", e)
            return Response(
                {"error": f"Failed to analyze: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DocumentListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            folder_id = request.data.get("folderId")
            print("Folder id", folder_id)
            folder = UserFolder.objects.get(id=folder_id, user=user)

            # load only active documents and id, name columns
            documents = UserDocument.objects.filter(folder=folder, active=True).values(
                "id", "document_name"
            )

            document_list = []
            for document in documents:
                document_list.append(
                    {"id": document["id"], "name": document["document_name"]}
                )

            print("documents", document_list)
            return Response({"documents": document_list}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Document fetching error", e)
            return Response(
                {"error": f"Failed to analyze: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


################### REPORT RELATED VIEWS ###################


# this view handles new report generation
# TODO: Can trigger document summarization later


class NewReportView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            reportName = request.data.get("reportName")
            print("Adding report with name " + reportName)
            # Create a Report object
            report = UserReport.objects.create(
                user=user,
                name=reportName,
                revision_number=1 # initial version is set to 1
            )

            report.report_id = report.id
            report.save()
            return Response({"reportId": report.id}, status=status.HTTP_200_OK)

        except Exception as e:
            print("User Report error", e)
            return Response(
                {"error": f"Failed to add report: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ReportView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            print("Getting report")
            user = User.objects.get(id=1)

            # Check if "reportId" exists in the request data
            if "reportId" in request.data:
                report_id = request.data["reportId"]
                if "versionId" in request.data:
                    revision_number = request.data["versionId"]
                else:
                    revision_number = 1

                print(
                    "Getting report with id - version "
                    + str(report_id)
                    + " - "
                    + str(revision_number)
                )

                # Retrieve Report object
                report = UserReport.objects.get(
                    user=user, report_id=report_id, revision_number=revision_number
                )
                serializer = UserReportSerializer(report)

                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Missing 'reportId' in request data."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            print("User Report error", e)
            return Response(
                {"error": f"Failed to retrieve report: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# Retrieve all reports for a user
class ReportListView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)

            # Retrieve a queryset of UserReport objects for the user
            user_reports = UserReport.objects.filter(
                user=user, revision_number=1
            ).order_by("name")

            # Create a dictionary mapping report names to their IDs
            report_data = [
                {"name": report.name, "id": report.id} for report in user_reports
            ]
            print("Retrieved reports", report_data)

            # Return the data as a JSON response
            return Response({"reports": report_data}, status=200)

        except Exception as e:
            print("User Report error", e)
            return Response(
                {"error": f"Failed to add report: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# Retrieve all versions of a report
class ReportVersionsView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            report_id = request.data.get("reportId")
            # Retrieve a queryset of UserReport objects for the user
            report_versions = UserReport.objects.filter(
                user=user, report_id=report_id
            ).order_by("-revision_number")

            serializer = ReportVersionSerializer(report_versions, many=True)
            serialized_data = serializer.data
            print("Retrieved versions of the report", serialized_data)

            # Return the data as a JSON response
            return Response({"versions": serialized_data}, status=200)

        except Exception as e:
            print("User Report error", e)
            return Response(
                {"error": f"Failed to add report: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# DOCUMENT SUMMARY AND INSIGHT GENERATION RELATED VIEWS

import json
from django.db.models import Max


class SummarizeView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # set default user to admin
            # TODO: Remove default assignment
            user = User.objects.get(id=1)
            report_id = request.data.get("reportId")
            document_id = request.data.get("documentId")
            print("Summarizing report-document", report_id, document_id)
            document = UserDocument.objects.get(user=user, id=document_id)
            report = UserReport.objects.get(user=user, id=report_id)

            file_path = document.document.url
            # remove the leading slash
            if file_path.startswith("/"):
                file_path = file_path[1:]

            # llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-0125")
            llm = ChatOpenAI(temperature=0, model_name="gpt-4-0125-preview")
            text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
            texts = split2texts(file_path, text_splitter)
            print("text size", len(texts))

            summary = summary_chain(texts, llm)
            summary = summary.replace("```python\n", "").replace("\n```", "")
            summary = json.loads(summary)

            max_revision_number = UserReport.objects.filter(
                report_id=report.id
            ).aggregate(Max("revision_number"))["revision_number__max"]

            if max_revision_number is None:
                max_revision_number = 1

            # make a new revision of the current report
            report2 = UserReport.objects.create(
                user=user,
                name=report.name,
                ai_generated=True,
                report_id=report.id,
                revision_number=max_revision_number + 1,
            )
            print("Added revision for report", report2)

            for title, content in summary.items():
                ReportSection.objects.create(
                    user_report=report2, title=title, content=content
                )

            print("Added sections for report revision", report2)

            # Return the data as a JSON response
            return Response({"summary": summary}, status=200)

        except Exception as e:
            print("Summary Report error", e)
            return Response(
                {"error": f"Failed to summarize report: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

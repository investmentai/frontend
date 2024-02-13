from django.db import models
from django.db.models import ForeignKey
from django.contrib.auth.models import User
from encrypted_model_fields.fields import EncryptedCharField

############### LLM ###################


# define the LLM providers
class LLMProvider(models.Model):
    name = models.CharField(max_length=255)
    abbreviation = models.CharField(max_length=255, default="", null=True, blank=True)
    active = models.BooleanField(default=False)
    add_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


# api key for user
class UserApiKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    api_key = EncryptedCharField(max_length=255)
    llm = ForeignKey(LLMProvider, on_delete=models.PROTECT)
    active = models.BooleanField(default=False)
    default = models.BooleanField(default=False)
    add_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.llm.abbreviation not in [None, ""]:
            return f"{self.user.username}-{self.llm.abbreviation}-{self.id}"
        return f"{self.user.username}-{self.llm.name}-{self.id}"


class ChainType(models.TextChoices):
    ANALYSIS = "sec", "SEC"
    DOCUMENT = "document", "Document"


# add new user folder which is a container of documents
# folders can be any general topics such as science topics like pyhsics, chemistry, biology, etc.
class UserFolder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder_name = models.CharField(max_length=255, null=True, blank=True)
    active = models.BooleanField(default=True)
    add_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "user",
            "folder_name",
        )

    def __str__(self):
        return f"{self.folder_name}"


# save file to correct directory using this function
def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return "user_{0}/{1}".format(instance.user.id, filename)


# add new user document to a folder
# documents can be articles, book passages, code snippets, etc.
class UserDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)
    document_name = models.CharField(max_length=255, null=True, blank=True)
    # document = models.TextField()
    document = models.FileField(upload_to=user_directory_path)
    active = models.BooleanField(default=True)
    add_date = models.DateTimeField(auto_now_add=True)

    # class Meta:
    #     unique_together = (
    #         "user",
    #         "folder",
    #         "document_name",
    #     )

    def __str__(self):
        return f"{self.document_name}"


# add new user report which is a container of report sections
class UserReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    ai_generated = models.BooleanField(default=False)
    report_id = models.PositiveIntegerField(null=True, blank=True)
    revision_number = models.PositiveIntegerField(default=1)
    add_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        unique_together = ("user", "name", "revision_number")

    def __str__(self):
        return f"{self.name}"

    # def save(self, *args, **kwargs):
    #     # Check if the object already has an id (indicating it's already saved in the database)
    #     if not self.id:
    #         super().save(*args, **kwargs)  # Save the object to get an id

    #     # Assign id value to report_id field upon saving
    #     if not self.report_id:
    #         self.report_id = self.id
    #         super().save(*args, **kwargs)  # Save again to update report_id


# add sections to user reports
class ReportSection(models.Model):
    user_report = models.ForeignKey(
        UserReport, related_name="sections", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    add_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - Revision {self.revision_number}"

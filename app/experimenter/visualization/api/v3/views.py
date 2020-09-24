import json

from django.conf import settings
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from experimenter.experiments.models import NimbusExperiment


def load_data_from_gcs(filename):
    return (
        json.loads(default_storage.open(filename).read())
        if default_storage.exists(filename)
        else None
    )


def get_data(slug, window):
    data = {}
    filename = f"""statistics_{slug}_{window}.json"""
    data = load_data_from_gcs(filename)
    return data


@api_view()
def analysis_results_view(request, slug):
    windows = ["daily", "weekly", "overall"]

    experiment = get_object_or_404(NimbusExperiment.objects.filter(slug=slug))
    experiment_data = {"show_analysis": settings.FEATURE_ANALYSIS}
    recipe_slug = experiment.slug.replace("-", "_")

    for window in windows:
        experiment_data[window] = get_data(recipe_slug, window)

    return Response(experiment_data)

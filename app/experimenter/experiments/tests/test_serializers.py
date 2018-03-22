import datetime

from django.test import TestCase

from experimenter.experiments.models import Experiment
from experimenter.experiments.tests.factories import (
    ExperimentFactory,
    ExperimentVariantFactory,
)
from experimenter.experiments.serializers import (
    JSTimestampField,
    ExperimentSerializer,
    ExperimentVariantSerializer,
)


class TestJSTimestampField(TestCase):

    def test_field_serializes_to_js_time_format(self):
        field = JSTimestampField()
        example_datetime = datetime.datetime(2000, 1, 1, 1, 1, 1, 1)
        self.assertEqual(
            field.to_representation(example_datetime), 946688461000.0)

    def test_field_returns_none_if_no_datetime_passed_in(self):
        field = JSTimestampField()
        self.assertEqual(field.to_representation(None), None)


class TestExperimentVariantSerializer(TestCase):

    def test_serializer_outputs_expected_schema(self):
        variant = ExperimentVariantFactory.create()
        serialized = ExperimentVariantSerializer(variant)
        self.assertEqual(serialized.data, {
            'description': variant.description,
            'name': variant.name,
            'ratio': variant.ratio,
            'slug': variant.slug,
            'value': variant.value,
        })


class TestExperimentSerializer(TestCase):

    def test_serializer_outputs_expected_schema(self):
        experiment = ExperimentFactory.create_with_status(
            Experiment.STATUS_COMPLETE)
        serialized = ExperimentSerializer(experiment)
        expected_data = {
            'accept_url': experiment.accept_url,
            'client_matching': experiment.client_matching,
            'control': ExperimentVariantSerializer(experiment.control).data,
            'end_date': JSTimestampField().to_representation(
                experiment.end_date),
            'experiment_slug': experiment.experiment_slug,
            'experiment_url': experiment.experiment_url,
            'firefox_channel': experiment.firefox_channel,
            'firefox_version': experiment.firefox_version,
            'name': experiment.name,
            'objectives': experiment.objectives,
            'short_description': experiment.short_description,
            'population_percent': '{0:.4f}'.format(
                experiment.population_percent),
            'population': experiment.population,
            'pref_branch': experiment.pref_branch,
            'pref_key': experiment.pref_key,
            'pref_type': experiment.pref_type,
            'project_name': experiment.project.name,
            'project_slug': experiment.project.slug,
            'reject_url': experiment.reject_url,
            'slug': experiment.slug,
            'start_date': JSTimestampField().to_representation(
                experiment.start_date),
            'variant': ExperimentVariantSerializer(experiment.variant).data,
        }

        self.assertEqual(
            set(serialized.data.keys()), set(expected_data.keys()))
        self.assertEqual(serialized.data, expected_data)

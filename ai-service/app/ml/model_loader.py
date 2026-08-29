from pathlib import Path
import joblib


class ModelLoader:

    def __init__(
        self,
        model_path=None
    ):

        self.model = None

        if model_path:

            path = Path(model_path)

            if path.exists():

                self.model = joblib.load(
                    path
                )

    def is_loaded(self):

        return self.model is not None

    def predict(self, features):

        if self.model is None:

            return None

        prediction = self.model.predict(
            [features]
        )

        return prediction[0]
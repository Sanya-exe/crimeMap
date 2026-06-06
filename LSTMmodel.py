# model.py
import torch
import torch.nn as nn
import torch.nn.functional as F

class LSTMNet(nn.Module):
    def __init__(self, num_inputs=113*8, hidden_units=16):
        super().__init__()
        self.num_inputs = num_inputs  # this is the number of features
        self.hidden_units = hidden_units
        self.num_layers = 1

        self.lstm = nn.LSTM(
            input_size=num_inputs,
            hidden_size=hidden_units,
            batch_first=True,
            num_layers=self.num_layers
        )

        self.linear = nn.Linear(in_features=self.hidden_units, out_features=113*8)
        self.sigmoid = nn.Sigmoid()
        self.relu = nn.ReLU()

    def forward(self, x):
        batch_size = x.shape[0]
        h0 = torch.zeros(self.num_layers, batch_size, self.hidden_units)
        c0 = torch.zeros(self.num_layers, batch_size, self.hidden_units)

        _, (hn, _) = self.lstm(x, (h0, c0))

        out = self.relu(hn[0])
        out = self.linear(out)
        out = self.sigmoid(out)

        return out
    

   
